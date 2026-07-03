import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "../constants/api";

import DeleteModal from "../components/DeleteModal";
import FAQModal from "../components/FAQModal";
import FAQTab from "../components/faqTab";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import ProcessTab from "../components/processTab";
import TabSwitcher from "../components/TabSwitcher";
import TermsModal from "../components/TermsModal";

import { Colors } from "../constants/theme";

const CHECKLIST_PREFIX = "procedure_checklist_";

export default function ProcessScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { id, roleId } = useLocalSearchParams();

  const procedureId = parseInt(String(id), 10);

  const isAdmin = Number(roleId) === 2;

  const [activeTab, setActiveTab] =
    useState<"procedure" | "faq">("procedure");

  // =========================
  // DATA
  // =========================

  const [procedure, setProcedure] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [faqCategories, setFaqCategories] = useState<any[]>([]);

  // NEW
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  // =========================
  // EDIT
  // =========================

  const [isEditingProcedure, setIsEditingProcedure] =
    useState(false);

  // =========================
  // MODALS
  // =========================

  const [showAuthModal, setShowAuthModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showFAQModal, setShowFAQModal] =
    useState(false);

  const [deleteType, setDeleteType] =
    useState<"procedure" | "faq" | null>(null);

  const [selectedFAQ, setSelectedFAQ] =
    useState<any>(null);

  const [deletedSteps, setDeletedSteps] =
    useState<number[]>([]);

  const [deletedRequirements, setDeletedRequirements] =
    useState<number[]>([]);

  // =========================
  // LOAD CHECKLIST
  // =========================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !procedureId
    ) {
      return;
    }

    const saved = localStorage.getItem(
      `${CHECKLIST_PREFIX}${procedureId}`
    );

    if (saved) {
      try {
        setCheckedSteps(JSON.parse(saved));
      } catch {
        setCheckedSteps([]);
      }
    } else {
      setCheckedSteps([]);
    }
  }, [procedureId]);

  // =========================
  // SAVE CHECKLIST
  // =========================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !procedureId
    ) {
      return;
    }

    localStorage.setItem(
      `${CHECKLIST_PREFIX}${procedureId}`,
      JSON.stringify(checkedSteps)
    );
  }, [checkedSteps, procedureId]);

  // =========================
  // FETCH ALL
  // =========================

  const fetchAll = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/process/${procedureId}/`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      setProcedure(data.procedure ?? null);
      setSteps(data.steps ?? []);
      setRequirements(data.requirements ?? []);
      setFaqCategories(data.faq_categories ?? []);
    } catch (err) {
      console.error(
        "Failed to fetch process:",
        err
      );
    }
  };

  useEffect(() => {
    if (!procedureId || isNaN(procedureId))
      return;

    fetchAll();
  }, [procedureId]);

  // =========================
  // SAVE PROCESS
  // =========================

  const handleAuthSuccess = async () => {
    try {
      await fetch(
        `${API_BASE_URL}/process/${procedureId}/save/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            procedure_name:
              procedure.procedure_name,
            description:
              procedure.description,
            steps,
            requirements:
              requirements.map((req: any) => ({
                requirement_id:
                  req.requirement_id,
                requirement_name:
                  req.requirement_name ??
                  req.requirement_text ??
                  req.name ??
                  "",
              })),
          }),
        }
      );

      setDeletedSteps([]);
      setDeletedRequirements([]);

      alert("Updated successfully");

      setIsEditingProcedure(false);

      await fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =========================
  // DELETE PROCEDURE
  // =========================

  const handleDeleteProcedure =
    async () => {
      await fetch(
        `${API_BASE_URL}/procedures/${procedureId}/delete/`,
        {
          method: "DELETE",
        }
      );

      if (typeof window !== "undefined") {
        localStorage.removeItem(
          `${CHECKLIST_PREFIX}${procedureId}`
        );
      }

      router.back();
    };

  // =========================
  // DELETE FAQ
  // =========================

  const handleDeleteFAQ = async (
    id: number
  ) => {
    await fetch(
      `${API_BASE_URL}/faqs/${id}/delete/`,
      {
        method: "DELETE",
      }
    );

    await fetchAll();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          colors.background,
      }}
    >
      <Header title="Process" />

      <TabSwitcher
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      >
        {activeTab === "procedure" ? (
          <ProcessTab
            procedure={procedure}
            setProcedure={setProcedure}
            steps={steps}
            setSteps={setSteps}
            requirements={requirements}
            setRequirements={
              setRequirements
            }
            isAdmin={isAdmin}
            isEditing={
              isEditingProcedure
            }
            colors={colors}

            checkedSteps={checkedSteps}
            setCheckedSteps={
              setCheckedSteps
            }

            onEdit={() =>
              setIsEditingProcedure(
                true
              )
            }
            onCancel={() => {
              setIsEditingProcedure(
                false
              );
              fetchAll();
            }}
            onSave={() =>
              setShowAuthModal(true)
            }
            onDelete={() => {
              setDeleteType(
                "procedure"
              );
              setShowDeleteModal(
                true
              );
            }}

            setDeletedSteps={
              setDeletedSteps
            }
            setDeletedRequirements={
              setDeletedRequirements
            }

            deletedSteps={
              deletedSteps
            }
            deletedRequirements={
              deletedRequirements
            }
          />
                  ) : (
          <FAQTab
            faqs={faqCategories.flatMap((c: any) => c.faqs ?? [])}
            setFaqs={setFaqCategories}
            procedure={procedure}
            isAdmin={isAdmin}
            colors={colors}
            onSaveFAQInline={async (faq) => {
              await fetch(
                `${API_BASE_URL}/faqs/${faq.faq_id}/`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type":
                      "application/json",
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

      {/* FLOATING BUTTONS */}

      <FloatingButtons
        activeTab={activeTab}
        isAdmin={isAdmin}
        onTrackPress={() => {
          router.push({
            pathname: "/scan",
            params: {
              id: procedureId,
            },
          });
        }}
        onFAQPress={() => {
          if (isAdmin) {
            setShowFAQModal(true);
          }
        }}
      />

      {/* DELETE MODAL */}

      <DeleteModal
        visible={showDeleteModal}
        onCancel={() =>
          setShowDeleteModal(false)
        }
        onConfirm={async () => {
          if (
            deleteType === "procedure"
          ) {
            await handleDeleteProcedure();
          }

          if (
            deleteType === "faq" &&
            selectedFAQ
          ) {
            await handleDeleteFAQ(
              selectedFAQ.faq_id
            );
          }

          setShowDeleteModal(false);
          setSelectedFAQ(null);
          setDeleteType(null);
        }}
      />

      {/* AUTH MODAL */}

      <TermsModal
        visible={showAuthModal}
        onClose={() =>
          setShowAuthModal(false)
        }
      />

      {/* FAQ MODAL */}

      {isAdmin && (
        <FAQModal
          visible={showFAQModal}
          onClose={() =>
            setShowFAQModal(false)
          }
          procedureId={procedureId}
          isAdmin={isAdmin}
          onSave={async (
            procedureId,
            data
          ) => {
            await fetch(
              `${API_BASE_URL}/faqs/create/`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  procedure: procedureId,
                  question:
                    data.question,
                  answer:
                    data.answer,
                }),
              }
            );

            setShowFAQModal(false);

            await fetchAll();
          }}
        />
      )}
    </SafeAreaView>
  );
}