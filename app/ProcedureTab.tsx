import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "../constants/api";
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
  const roleId = params.roleId;
  const isAdmin = Number(roleId) === 2;

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

      const res = await fetch(`${API_BASE_URL}/process/${procedureId}/`, {
        cache: "no-store",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("STATUS:", res.status);

      const contentType = res.headers.get("content-type");

      let data: any = null;

      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.log("NON-JSON RESPONSE:", text);
        return;
      }

      if (!res.ok) {
        console.log("ERROR RESPONSE:", data);
        console.log("FULL RESPONSE", JSON.stringify(data, null, 2));
        console.log("Requirements:", JSON.stringify(data.requirements, null, 2));
        return;
      }

      setProcedure(data?.procedure ?? null);
      setSteps(data?.steps ?? []);
      setRequirements(data?.requirements ?? []);
      setFaqCategories(data?.faq_categories ?? []);
    } catch (err) {
      console.error("FAILED FETCH:", err);
    }
  };

  // =========================
  // AUTO REFRESH ON FOCUS (FIX)
  // =========================
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [procedureId])
  );

  // =========================
  // SAVE PROCESS
  // =========================
  const handleAuthSuccess = async () => {
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


    // reset deleted items
    setDeletedSteps([]);
    setDeletedRequirements([]);


    // leave edit mode
    setIsEditingProcedure(false);


    // close authentication modal
    setShowAdminAuthModal(false);


    // refresh data
    await fetchAll();


    // show temporary confirmation
    setSuccessMessage("Changes saved successfully");


    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);


  } catch (error) {
    console.log("SAVE ERROR:", error);
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
        method:"DELETE",
        headers:{
          Authorization:`Token ${token}`,
        },
      }
    );


    if(!response.ok){
      throw new Error("Delete failed");
    }


    localStorage.removeItem(
      `${CHECKLIST_PREFIX}${procedureId}`
    );


    router.replace({
      pathname: "/ProcedurePage",
      params: {
        roleId: "2",
        message: "Procedure deleted successfully.",
      },
    });

  };

  // =========================
  // DELETE FAQ
  // =========================
  const handleDeleteFAQ = async (id:number)=>{

    const token = await getToken();


    const response = await fetch(
      `${API_BASE_URL}/faqs/${id}/delete/`,
      {
        method:"DELETE",
        headers:{
          Authorization:`Token ${token}`,
        },
      }
    );


    if(!response.ok){
      throw new Error("FAQ delete failed");
    }


    await fetchAll();

  };

  // =========================
  // UI
  // =========================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Process" roleId={roleId as string} />

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
            isEditing={isEditingProcedure}
            colors={colors}
            checkedSteps={checkedSteps}
            setCheckedSteps={setCheckedSteps}
            onEdit={() => setIsEditingProcedure(true)}
            onCancel={async () => {
              await fetchAll();
              setIsEditingProcedure(false);
            }}
            onSave={() => {
              console.log("Opening admin auth");
              setShowAdminAuthModal(true);
            }}
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

                      const updated =
                        updatedFaqs.find(
                          (item:any) =>
                            item.faq_id === faq.faq_id
                        );

                      return updated ?? faq;

                    }) ?? [],

                }))
              );

            }}

            procedure={procedure}

            isAdmin={isAdmin}

            colors={colors}

            onSaveFAQInline={async (faq) => {

              await fetch(
                `${API_BASE_URL}/faqs/${faq.faq_id}/`,
                {
                  method: "PATCH",

                  headers: {
                    "Content-Type": "application/json",
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

      {!isAdmin && (
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

      {isAdmin && (
        <AdminAuthModal
          visible={showAdminAuthModal}
          onClose={() => setShowAdminAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {isAdmin && (
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


              setSuccessMessage(
                "Deleted successfully"
              );


              setTimeout(() => {
                setSuccessMessage("");
              },3000);


            } catch(error){

              console.log(
                "DELETE ERROR:",
                error
              );

            }

          }}
        />
      )}
    </SafeAreaView>
  );
}