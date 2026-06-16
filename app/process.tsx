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

export default function ProcessScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { id, roleId } = useLocalSearchParams();
  const procedureId = id ? Number(id) : 1;

  const isAdmin = Number(roleId) === 2;

  const [activeTab, setActiveTab] =
    useState<"procedure" | "faq">("procedure");

  // =========================
  // DATA
  // =========================
  const [procedure, setProcedure] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // =========================
  // EDIT STATE
  // =========================
  const [isEditingProcedure, setIsEditingProcedure] = useState(false);

  // =========================
  // MODALS
  // =========================
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const [deleteType, setDeleteType] =
    useState<"procedure" | "faq" | null>(null);

  const [selectedFAQ, setSelectedFAQ] = useState<any>(null);

  const [deletedSteps, setDeletedSteps] = useState<number[]>([]);
  const [deletedRequirements, setDeletedRequirements] = useState<number[]>(
    []
  );

  const fetchAll = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/process/${procedureId}/`
      );

      const data = await res.json();

      setProcedure(data.procedure);
      setSteps(data.steps || []);
      setRequirements(data.requirements || []);
      setFaqs(data.faqs || []);
    } catch (err) {
      console.error("Failed to fetch process:", err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [procedureId]);

  // =========================
  // SAVE FULL PROCESS (NEW API)
  // =========================
  const handleAuthSuccess = async () => {
    try {
      await fetch(
        `${API_BASE_URL}/process/${procedureId}/save/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            procedure_name: procedure.procedure_name,
            description: procedure.description,
            steps,
            requirements,
          }),
        }
      );

      setDeletedSteps([]);
      setDeletedRequirements([]);

      alert("Updated successfully");
      setIsEditingProcedure(false);

      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // =========================
  // DELETE PROCEDURE
  // =========================
  const handleDeleteProcedure = async () => {
    await fetch(
      `${API_BASE_URL}/procedures/${procedureId}/delete/`,
      {
        method: "DELETE",
      }
    );

    router.back();
  };

  // =========================
  // DELETE FAQ
  // =========================
  const handleDeleteFAQ = async (id: number) => {
    await fetch(`${API_BASE_URL}/faqs/${id}/delete/`, {
      method: "DELETE",
    });

    fetchAll();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
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
            setRequirements={setRequirements}
            isAdmin={isAdmin}
            isEditing={isEditingProcedure}
            colors={colors}
            onEdit={() => setIsEditingProcedure(true)}
            onCancel={() => {
              setIsEditingProcedure(false);
              fetchAll();
            }}
            onSave={() => setShowAuthModal(true)}
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
            faqs={faqs}
            setFaqs={setFaqs}
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

              fetchAll();
            }}
            onRequestDelete={(faq) => {
              setSelectedFAQ(faq);
              setDeleteType("faq");
              setShowDeleteModal(true);
            }}
          />
        )}
      </ScrollView>

      {/* ========================= */}
      {/* FLOATING BUTTONS */}
      {/* ========================= */}
      <FloatingButtons
        activeTab={activeTab}
        isAdmin={isAdmin}
        onTrackPress={() => {
          router.push({
            pathname: "/scan",
            params: { id: procedureId },
          });
        }}
        onFAQPress={() => setShowFAQModal(true)}
      />

      {/* ========================= */}
      {/* DELETE MODAL */}
      {/* ========================= */}
      <DeleteModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (deleteType === "procedure") {
            await handleDeleteProcedure();
          }

          if (deleteType === "faq" && selectedFAQ) {
            await handleDeleteFAQ(selectedFAQ.faq_id);
          }

          setShowDeleteModal(false);
          setSelectedFAQ(null);
          setDeleteType(null);
        }}
      />

      {/* ========================= */}
      {/* AUTH MODAL */}
      {/* ========================= */}
      <TermsModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* ========================= */}
      {/* FAQ MODAL */}
      {/* ========================= */}
      <FAQModal
        visible={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        procedureId={procedureId}
        isAdmin={isAdmin}
        onSave={async (procedureId, data) => {
          await fetch(`${API_BASE_URL}/faqs/create/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              procedure: procedureId,
              question: data.question,
              answer: data.answer,
            }),
          });

          setShowFAQModal(false);
          fetchAll();
        }}
      />
    </SafeAreaView>
  );
}