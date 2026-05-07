import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../lib/supabase";

import AdminMenu from "../components/AdminMenu";
import AuthModal from "../components/AuthModal";
import DeleteModal from "../components/DeleteModal";
import FAQCard from "../components/FAQCard";
import FAQModal from "../components/FAQModal";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import StepItem from "../components/StepItem";
import TabSwitcher from "../components/TabSwitcher";

import { Colors } from "../constants/theme";

export default function ProcessScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { id, roleId } = useLocalSearchParams();

  const procedureId = id ? Number(id) : 1;

  // ROLE CHECK
  const isAdmin = Number(roleId) === 2;

  const [activeTab, setActiveTab] =
    useState<"procedure" | "faq">("procedure");

  // UI
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // MODALS
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const [editingFAQ, setEditingFAQ] = useState<any>(null);

  // DATA
  const [procedure, setProcedure] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  // STATES
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------- FETCH ALL ----------------

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [proc, stepsRes, reqRes, faqRes] =
        await Promise.all([
          supabase
            .from("procedures")
            .select("*")
            .eq("procedure_id", procedureId)
            .maybeSingle(),

          supabase
            .from("procedure_steps")
            .select("*")
            .eq("procedure_id", procedureId)
            .order("step_number", {
              ascending: true,
            }),

          supabase
            .from("procedure_requirements")
            .select("*")
            .eq("procedure_id", procedureId),

          supabase
            .from("faqs")
            .select("*")
            .eq("procedure_id", procedureId),
        ]);

      if (proc.error) throw proc.error;

      setProcedure(proc.data);
      setSteps(stepsRes.data || []);
      setRequirements(reqRes.data || []);
      setFaqs(faqRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [procedureId]);

  // ---------------- HANDLERS ----------------

  const handleSave = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setIsEditing(false);
    alert("Saved successfully");
  };

  const handleDeleteFAQ = (id: number) => {
    setFaqs((prev) =>
      prev.filter((f) => f.faq_id !== id)
    );
  };

  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setShowFAQModal(true);
  };

  const handleEditFAQ = (faq: any) => {
    setEditingFAQ(faq);
    setShowFAQModal(true);
  };

  const handleSaveFAQ = (data: any) => {
    // USER MODE
    if (!isAdmin) {
      alert("Question submitted successfully!");
      setShowFAQModal(false);
      return;
    }

    // ADMIN MODE
    if (editingFAQ) {
      setFaqs((prev) =>
        prev.map((f) =>
          f.faq_id === editingFAQ.faq_id
            ? { ...f, ...data }
            : f
        )
      );
    } else {
      setFaqs((prev) => [
        ...prev,
        {
          faq_id: Date.now(),
          ...data,
        },
      ]);
    }

    setShowFAQModal(false);
  };

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // ---------------- ERROR ----------------

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  // ---------------- UI ----------------

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header title="Process" />

      <TabSwitcher
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ScrollView
        contentContainerStyle={styles.content}
      >
        {/* TITLE */}
        <View style={styles.headerRow}>
          {isEditing ? (
            <TextInput
              value={
                procedure?.procedure_name || ""
              }
              onChangeText={(text) =>
                setProcedure((p: any) => ({
                  ...p,
                  procedure_name: text,
                }))
              }
              style={styles.input}
            />
          ) : (
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              {procedure?.procedure_name}
            </Text>
          )}

          {isAdmin && (
            <TouchableOpacity
              onPress={() =>
                setShowMenu(!showMenu)
              }
            >
              <Text style={styles.dots}>⋮</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ADMIN MENU */}
        {showMenu && (
          <AdminMenu
            onEdit={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            onDelete={() =>
              setShowDeleteModal(true)
            }
          />
        )}

        {/* DESCRIPTION */}
        {isEditing ? (
          <TextInput
            value={procedure?.description || ""}
            onChangeText={(text) =>
              setProcedure((p: any) => ({
                ...p,
                description: text,
              }))
            }
            multiline
            style={styles.input}
          />
        ) : (
          <Text
            style={[
              styles.description,
              { color: colors.icon },
            ]}
          >
            {procedure?.description}
          </Text>
        )}

        {/* PROCEDURE TAB */}
        {activeTab === "procedure" && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              Requirements
            </Text>

            <View style={styles.requirements}>
              {requirements.map((req) => (
                <Text
                  key={req.requirement_id}
                  style={{
                    color: colors.text,
                  }}
                >
                  • {req.requirement_text}
                </Text>
              ))}
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              Steps
            </Text>

            {steps.map((step) => (
              <StepItem
                key={step.step_id}
                number={step.step_number}
                text={step.step_description}
                sub={step.office_location}
              />
            ))}
          </>
        )}

        {/* FAQ TAB */}
        {activeTab === "faq" && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text },
              ]}
            >
              FAQs
            </Text>

            {faqs.map((faq) => (
              <FAQCard
                key={faq.faq_id}
                question={faq.question}
                answer={faq.answer}
                isAdmin={isAdmin}
                onEdit={() =>
                  handleEditFAQ(faq)
                }
                onDelete={() =>
                  handleDeleteFAQ(
                    faq.faq_id
                  )
                }
              />
            ))}

            {/* ADMIN ONLY */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddFAQ}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: colors.text,
                  }}
                >
                  ＋ Add FAQ
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* SAVE */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
          >
            <Text style={{ color: "#fff" }}>
              Save
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FLOATING BUTTONS */}
      <FloatingButtons
        activeTab={activeTab}
        onTrackPress={() =>
          router.push({
            pathname: "/scan",
            params: { roleId },
          })
        }
        onQuestionPress={() => {
          setEditingFAQ(null);
          setShowFAQModal(true);
        }}
      />

      {/* AUTH MODAL */}
      <AuthModal
        visible={showAuthModal}
        onClose={() =>
          setShowAuthModal(false)
        }
        onSuccess={handleAuthSuccess}
      />

      {/* DELETE MODAL */}
      <DeleteModal
        visible={showDeleteModal}
        onCancel={() =>
          setShowDeleteModal(false)
        }
        onConfirm={() =>
          setShowDeleteModal(false)
        }
      />

      {/* FAQ MODAL */}
      <FAQModal
        visible={showFAQModal}
        onClose={() =>
          setShowFAQModal(false)
        }
        onSave={handleSaveFAQ}
        initialData={editingFAQ}
        isAdmin={isAdmin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
  },

  dots: {
    fontSize: 20,
  },

  description: {
    marginTop: 10,
  },

  sectionTitle: {
    marginTop: 20,
    fontWeight: "600",
  },

  requirements: {
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },

  saveBtn: {
    marginTop: 20,
    backgroundColor: Colors.light.tint,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },

  addBtn: {
    marginTop: 20,
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});