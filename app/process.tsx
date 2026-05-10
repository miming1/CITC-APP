import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../lib/supabase";

import FAQTab from "../components/faqTab";
import Header from "../components/Header";
import ProcessTab from "../components/processTab";
import TabSwitcher from "../components/TabSwitcher";

import AuthModal from "../components/AuthModal";
import DeleteModal from "../components/DeleteModal";
import FAQModal from "../components/FAQModal";

import { verifyCurrentPassword } from "@/lib/auth";
import { Colors } from "../constants/theme";

export default function ProcessScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { id, roleId } = useLocalSearchParams();
  const procedureId = id ? Number(id) : 1;

  const isAdmin = Number(roleId) === 2;

  const [activeTab, setActiveTab] = useState<"procedure" | "faq">("procedure");

  // DATA
  const [procedure, setProcedure] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // EDIT STATE
  const [isEditingProcedure, setIsEditingProcedure] = useState(false);

  // MODALS
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const [deleteType, setDeleteType] = useState<"procedure" | "faq" | null>(null);
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null);

  // 🔥 DELETE TRACKERS (IMPORTANT FIX)
  const [deletedSteps, setDeletedSteps] = useState<number[]>([]);
  const [deletedRequirements, setDeletedRequirements] = useState<number[]>([]);

  const fetchAll = async () => {
    const [proc, stepsRes, reqRes, faqRes] = await Promise.all([
      supabase.from("procedures").select("*").eq("procedure_id", procedureId).maybeSingle(),
      supabase.from("procedure_steps").select("*").eq("procedure_id", procedureId).order("step_number"),
      supabase.from("procedure_requirements").select("*").eq("procedure_id", procedureId),
      supabase.from("faqs").select("*").eq("procedure_id", procedureId),
    ]);

    setProcedure(proc.data);
    setSteps(stepsRes.data || []);
    setRequirements(reqRes.data || []);
    setFaqs(faqRes.data || []);
  };

  useEffect(() => {
    fetchAll();
  }, [procedureId]);

  // =========================
  // SAVE PROCEDURE
  // =========================
  const handleAuthSuccess = async () => {
    try {
      // 1. update procedure
      await fetch(`http://127.0.0.1:8000/api/procedures/${procedureId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procedure_name: procedure.procedure_name,
          description: procedure.description,
        }),
      });

      // =========================
      // DELETE REQUIREMENTS
      // =========================
      for (const id of deletedRequirements) {
        await supabase
          .from("procedure_requirements")
          .delete()
          .eq("requirement_id", id);
      }

      // UPDATE / INSERT REQUIREMENTS
      for (const req of requirements) {
        if (req.requirement_id) {
          await supabase
            .from("procedure_requirements")
            .update({ requirement_text: req.requirement_text })
            .eq("requirement_id", req.requirement_id);
        } else {
          await supabase.from("procedure_requirements").insert({
            procedure_id: procedureId,
            requirement_text: req.requirement_text,
          });
        }
      }

      // =========================
      // DELETE STEPS
      // =========================
      for (const id of deletedSteps) {
        await supabase
          .from("procedure_steps")
          .delete()
          .eq("step_id", id);
      }

      // UPDATE / INSERT STEPS
      for (const step of steps) {
        if (step.step_id) {
          await supabase
            .from("procedure_steps")
            .update({
              step_description: step.step_description,
              office_location: step.office_location,
              reference_link: step.reference_link,
            })
            .eq("step_id", step.step_id);
        } else {
          await supabase.from("procedure_steps").insert({
            procedure_id: procedureId,
            step_number: step.step_number,
            step_description: step.step_description,
            office_location: step.office_location,
            reference_link: step.reference_link,
          });
        }
      }

      // RESET DELETE TRACKERS
      setDeletedSteps([]);
      setDeletedRequirements([]);

      alert("Updated successfully");
      setIsEditingProcedure(false);
      fetchAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProcedure = async () => {
    await fetch(`http://127.0.0.1:8000/api/procedures/${procedureId}/delete/`, {
      method: "DELETE",
    });

    router.back();
  };

  const handleDeleteFAQ = async (id: number) => {
    await fetch(`http://127.0.0.1:8000/api/faqs/${id}/delete/`, {
      method: "DELETE",
    });

    fetchAll();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Process" />

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
            onEdit={() => setIsEditingProcedure(true)}
            onCancel={() => {
              setIsEditingProcedure(false);
              fetchAll();
            }}
            onSave={() => setShowAuthModal(true)}
            onDelete={() => setShowDeleteModal(true)}
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
              await fetch(`http://127.0.0.1:8000/api/faqs/${faq.faq_id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: faq.question,
                  answer: faq.answer,
                }),
              });

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

      <DeleteModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (deleteType === "procedure") await handleDeleteProcedure();
          if (deleteType === "faq" && selectedFAQ) {
            await handleDeleteFAQ(selectedFAQ.faq_id);
          }

          setShowDeleteModal(false);
          setSelectedFAQ(null);
          setDeleteType(null);
        }}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        verifyPassword={verifyCurrentPassword}
      />

      <FAQModal
        visible={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        procedureId={procedureId}
        isAdmin={isAdmin}
        onSave={async (procedureId, data) => {
          await fetch("http://127.0.0.1:8000/api/faqs/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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