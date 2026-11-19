import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL, ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";

import AdminAuthModal from "../components/Admin Components/ActionAuthentication";
import DeleteModal from "../components/Admin Components/DeleteConfirmation";
import FAQTab from "../components/Universal Components/FAQTab";
import FloatingButtons from "../components/Universal Components/FloatingButtons";
import Header from "../components/Universal Components/Header";
import ProcessTab from "../components/Universal Components/ProcessTab";
import TabSwitcher from "../components/Universal Components/TabSwitcher";

import { getToken } from "@/lib/auth";

const CHECKLIST_PREFIX = "procedure_checklist_";

export default function ProcessScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const router = useRouter();
  const params = useLocalSearchParams();

  const procedureId = Number(params.procedure_id ?? params.id);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [procedureOfficeIds, setProcedureOfficeIds] = useState<number[]>([]);

  // Profile must be loaded before we know which UI to show
  const profileLoaded = userProfile !== null;

  // Get user role and office
  const roleId = Number(userProfile?.role_id);
  const officeId = Number(userProfile?.office_id);

  // Any staff-side role (Operational Admin, Dean, Chairperson, Staff, Faculty)
  const isAdmin = roleId >= 2;

  // The server decides who may edit this procedure (role + office rules)
  const [canEdit, setCanEdit] = useState(false);
  const canManageProcedure = canEdit;

  const [activeTab, setActiveTab] = useState<"procedure" | "faq">("procedure");

  const [procedure, setProcedure] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [faqCategories, setFaqCategories] = useState<any[]>([]);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  const [isEditingProcedure, setIsEditingProcedure] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdminDeleteAuthModal, setShowAdminDeleteAuthModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"procedure" | "faq" | null>(null);
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null);

  const [deletedSteps, setDeletedSteps] = useState<number[]>([]);
  const [deletedRequirements, setDeletedRequirements] = useState<number[]>([]);

  // =========================
  // CHECKLIST LOAD
  // =========================
  useEffect(() => {
    if (typeof window === "undefined" || !procedureId) return;

    const saved = localStorage.getItem(`${CHECKLIST_PREFIX}${procedureId}`);

    try {
      setCheckedSteps(saved ? JSON.parse(saved) : []);
    } catch {
      setCheckedSteps([]);
    }
  }, [procedureId]);

  // =========================
  // CHECKLIST SAVE
  // =========================
  useEffect(() => {
    if (typeof window === "undefined" || !procedureId) return;

    localStorage.setItem(
      `${CHECKLIST_PREFIX}${procedureId}`,
      JSON.stringify(checkedSteps)
    );
  }, [checkedSteps, procedureId]);

  // =========================
  // SAFE FETCH ALL
  // =========================
  const fetchAll = async () => {
    try {
      const token = await getToken();

      if (!token || !procedureId) return;

      const headers = {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      };

      // GET AUTHENTICATED USER PROFILE
      const profileResponse = await fetch(ENDPOINTS.me, { headers });

      if (!profileResponse.ok) {
        throw new Error("Unable to retrieve user profile");
      }

      setUserProfile(await profileResponse.json());

      // GET OFFICES ASSOCIATED WITH THIS PROCEDURE
      // Not fatal: if this fails the user simply can't manage the procedure.
      try {
        const officeResponse = await fetch(
          `${API_BASE_URL}/process/${procedureId}/offices/`,
          { headers }
        );

        if (officeResponse.ok) {
          const officeData = await officeResponse.json();
          setProcedureOfficeIds(
            officeData.map((item: any) => Number(item.office_id))
          );
        } else {
          console.log("Offices request failed:", officeResponse.status);
          setProcedureOfficeIds([]);
        }
      } catch (e) {
        console.log("Offices request error:", e);
        setProcedureOfficeIds([]);
      }

      // GET PROCEDURE DETAILS
      const res = await fetch(
        `${API_BASE_URL}/process/${procedureId}/`,
        {
          cache: "no-store",
          headers,
        }
      );

      const contentType = res.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        console.log("Invalid response format");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        console.log("ERROR RESPONSE:", data);
        return;
      }

      setCanEdit(!!data?.can_edit);
      setProcedure(data?.procedure ?? null);
      setSteps(data?.steps ?? []);
      setRequirements(data?.requirements ?? []);
      setFaqCategories(data?.faq_categories ?? []);

    } catch (err) {
      console.error("FAILED FETCH:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [procedureId])
  );

  // =========================
  // SAVE PROCESS
  // =========================
  const handleAuthSuccess = async (): Promise<boolean> => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${API_BASE_URL}/process/${procedureId}/save/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            procedure_name: procedure.procedure_name,
            description: procedure.description,

            steps,

            requirements: requirements.map((req: any) => ({
              requirement_id: req.requirement_id,
              requirement_name:
                req.requirement_name ??
                req.requirement_text ??
                req.name ??
                "",
              is_document: req.is_document ?? false,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setDeletedSteps([]);
      setDeletedRequirements([]);
      setIsEditingProcedure(false);
      setShowAdminAuthModal(false);

      await fetchAll();

      setSuccessMessage("Changes saved successfully");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return true;

    } catch (error) {
      console.log("SAVE ERROR:", error);
      return false;
    }
  };

  // =========================
  // DELETE PROCEDURE
  // =========================
  const handleDeleteProcedure = async () => {
    const token = await getToken();

    const response = await fetch(
      `${API_BASE_URL}/procedures/${procedureId}/delete/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    localStorage.removeItem(`${CHECKLIST_PREFIX}${procedureId}`);

    router.replace({
      pathname: "/ProcedurePage",
      params: {
        roleId: String(roleId),
        admin_mode: isAdmin ? "true" : "false",
        message: "Procedure deleted successfully.",
      },
    });
  };

  // =========================
  // DELETE FAQ
  // =========================
  const handleDeleteFAQ = async (id: number) => {
    const token = await getToken();

    const response = await fetch(
      `${API_BASE_URL}/faqs/${id}/delete/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("FAQ delete failed");
    }

    await fetchAll();
  };

  // =========================
  // UI
  // =========================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Process"
        roleId={profileLoaded ? String(roleId) : undefined}
      />

      {successMessage && (
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            backgroundColor: colorScheme === "dark"
              ? "#14532D"
              : "#DCFCE7",
          }}
        >
          <Text
            style={{
              color: colorScheme === "dark"
                ? "#BBF7D0"
                : "#166534",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {successMessage}
          </Text>
        </View>
      )}

      <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {activeTab === "procedure" ? (
          <ProcessTab
            procedure={procedure}
            setProcedure={setProcedure}
            steps={steps}
            setSteps={setSteps}
            requirements={requirements}
            setRequirements={setRequirements}
            isAdmin={isAdmin}
            canManageProcedure={canManageProcedure}
            isEditing={isEditingProcedure}
            colors={colors}
            checkedSteps={checkedSteps}
            setCheckedSteps={setCheckedSteps}
            onEdit={() => setIsEditingProcedure(true)}
            onCancel={async () => {
              await fetchAll();
              setIsEditingProcedure(false);
            }}
            onSave={() => setShowAdminAuthModal(true)}
            onDelete={() => {
              setDeleteType("procedure");
              setShowDeleteModal(true);
            }}
            setDeletedSteps={setDeletedSteps}
            setDeletedRequirements={setDeletedRequirements}
            deletedSteps={deletedSteps}
            deletedRequirements={deletedRequirements}
          />
        ) : (
          <FAQTab
            faqs={
              faqCategories.flatMap(
                (c: any) => c.faqs ?? []
              )
            }

            setFaqs={(updatedFaqs) => {
              setFaqCategories((prev) =>
                prev.map((category) => ({
                  ...category,
                  faqs:
                    category.faqs?.map((faq: any) => {
                      const updated = updatedFaqs.find(
                        (item: any) => item.faq_id === faq.faq_id
                      );
                      return updated ?? faq;
                    }) ?? [],
                }))
              );
            }}

            procedure={procedure}

            isAdmin={canManageProcedure}

            colors={colors}

            onSaveFAQInline={async (faq) => {
              const token = await getToken();

              await fetch(
                `${API_BASE_URL}/faqs/${faq.faq_id}/`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                  },
                  body: JSON.stringify({
                    question: faq.question,
                    answer: faq.answer,
                  }),
                }
              );

              await fetchAll();
            }}

            onRequestDelete={(faq) => {
              setSelectedFAQ(faq);
              setDeleteType("faq");
              setShowDeleteModal(true);
            }}
          />
        )}
      </ScrollView>

      {profileLoaded && !isAdmin && (
        <FloatingButtons
          activeTab={activeTab}
          onTrackPress={() =>
            router.push({
              pathname: "/TrackingPage",
              params: { id: procedureId },
            })
          }
        />
      )}

      <DeleteModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          setShowAdminDeleteAuthModal(true);
        }}
      />

      {canManageProcedure && (
        <AdminAuthModal
          visible={showAdminAuthModal}
          onClose={() => setShowAdminAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {canManageProcedure && (
        <AdminAuthModal
          visible={showAdminDeleteAuthModal}
          onClose={() => setShowAdminDeleteAuthModal(false)}
          onSuccess={async () => {
            try {
              if (deleteType === "procedure") {
                await handleDeleteProcedure();
              }

              if (deleteType === "faq" && selectedFAQ) {
                await handleDeleteFAQ(selectedFAQ.faq_id);
              }

              setShowAdminDeleteAuthModal(false);
              setSelectedFAQ(null);
              setDeleteType(null);

              setSuccessMessage("Deleted successfully");

              setTimeout(() => {
                setSuccessMessage("");
              }, 3000);

              return true;

            } catch (error) {
              console.log("DELETE ERROR:", error);
              return false;
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}