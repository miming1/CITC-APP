import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";
import { ENDPOINTS } from "../constants/api";
import { getToken } from "../lib/auth";

type StepDraft = {
  step_number: number;
  step_description: string;
  office_location: string;
  reference_link: string;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddProcessModal({ visible, onClose, onCreated }: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<"procedure" | "faq">("procedure");

  const [procedureName, setProcedureName] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [steps, setSteps] = useState<StepDraft[]>([
    { step_number: 1, step_description: "", office_location: "", reference_link: "" },
  ]);

  const [categoryName, setCategoryName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // REQUIREMENTS
  // =========================
  const addRequirement = () => setRequirements([...requirements, ""]);

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const removeRequirement = (index: number) => {
    const updated = [...requirements];
    updated.splice(index, 1);
    setRequirements(updated.length ? updated : [""]);
  };

  // =========================
  // STEPS
  // =========================
  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_number: steps.length + 1,
        step_description: "",
        office_location: "",
        reference_link: "",
      },
    ]);
  };

  const updateStep = (index: number, field: keyof StepDraft, value: string) => {
    const updated = [...steps];
    (updated[index] as any)[field] = value;
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    const updated = [...steps];
    updated.splice(index, 1);
    const renumbered = updated.map((s, i) => ({ ...s, step_number: i + 1 }));
    setSteps(
      renumbered.length
        ? renumbered
        : [{ step_number: 1, step_description: "", office_location: "", reference_link: "" }]
    );
  };

  // =========================
  // RESET + CLOSE
  // =========================
  const resetForm = () => {
    setActiveTab("procedure");
    setProcedureName("");
    setDescription("");
    setRequirements([""]);
    setSteps([{ step_number: 1, step_description: "", office_location: "", reference_link: "" }]);
    setCategoryName("");
    setError("");
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    setError("");

    if (!procedureName.trim()) {
      setError("Procedure name is required.");
      setActiveTab("procedure");
      return;
    }

    const cleanedRequirements = requirements
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const cleanedSteps = steps
      .filter((s) => s.step_description.trim().length > 0)
      .map((s, i) => ({
        step_number: i + 1,
        step_description: s.step_description.trim(),
        office_location: s.office_location.trim(),
        reference_link: s.reference_link.trim(),
      }));

    try {
      setLoading(true);

      const token = await getToken();

      const res = await fetch(ENDPOINTS.createProcess, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          procedure_name: procedureName.trim(),
          description: description.trim(),
          category_name: categoryName.trim() || procedureName.trim(),
          requirements: cleanedRequirements,
          steps: cleanedSteps,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create process.");
        return;
      }

      resetForm();
      onCreated();
      onClose();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View
          style={[
            s.modalContainer,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          <Text style={[s.title, { color: theme.text, fontFamily: Fonts.rounded }]}>
            Add New Process
          </Text>
          <Text style={[s.subtitle, { color: theme.icon, fontFamily: Fonts.sans }]}>
            Create a procedure. A matching FAQ category will be created automatically —
            you can add the individual FAQs afterwards on the FAQ page.
          </Text>

          {/* TABS */}
          <View style={s.tabRow}>
            <TouchableOpacity
              style={[
                s.tabBtn,
                activeTab === "procedure" && { borderBottomColor: theme.tint, borderBottomWidth: 3 },
              ]}
              onPress={() => setActiveTab("procedure")}
            >
              <Text style={[s.tabText, { color: theme.text }]}>Procedure</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.tabBtn,
                activeTab === "faq" && { borderBottomColor: theme.tint, borderBottomWidth: 3 },
              ]}
              onPress={() => setActiveTab("faq")}
            >
              <Text style={[s.tabText, { color: theme.text }]}>FAQ</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            {activeTab === "procedure" ? (
              <>
                {/* PROCEDURE NAME */}
                <Text style={[s.label, { color: theme.text }]}>Procedure Name</Text>
                <TextInput
                  value={procedureName}
                  onChangeText={setProcedureName}
                  placeholder="e.g. Grade Appeal"
                  placeholderTextColor={theme.icon}
                  style={[s.input, { color: theme.text, borderColor: theme.border }]}
                />

                {/* DESCRIPTION */}
                <Text style={[s.label, { color: theme.text }]}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Short description of this process"
                  placeholderTextColor={theme.icon}
                  multiline
                  style={[s.textArea, { color: theme.text, borderColor: theme.border }]}
                />

                {/* REQUIREMENTS */}
                <View style={s.sectionHeader}>
                  <Text style={[s.label, { color: theme.text, marginBottom: 0 }]}>
                    Requirements
                  </Text>
                  <TouchableOpacity onPress={addRequirement}>
                    <Text style={{ color: theme.tint, fontWeight: "700" }}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                {requirements.map((req, index) => (
                  <View key={index} style={s.rowItem}>
                    <TextInput
                      value={req}
                      onChangeText={(text) => updateRequirement(index, text)}
                      placeholder={`Requirement ${index + 1}`}
                      placeholderTextColor={theme.icon}
                      style={[s.input, { flex: 1, color: theme.text, borderColor: theme.border }]}
                    />
                    <TouchableOpacity onPress={() => removeRequirement(index)} style={s.removeBtn}>
                      <Ionicons name="close-circle" size={22} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* STEPS */}
                <View style={s.sectionHeader}>
                  <Text style={[s.label, { color: theme.text, marginBottom: 0 }]}>
                    Steps
                  </Text>
                  <TouchableOpacity onPress={addStep}>
                    <Text style={{ color: theme.tint, fontWeight: "700" }}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                {steps.map((step, index) => (
                  <View
                    key={index}
                    style={[s.stepCard, { borderColor: theme.border }]}
                  >
                    <View style={s.stepCardHeader}>
                      <Text style={[s.stepNumber, { color: theme.tint }]}>
                        Step {index + 1}
                      </Text>
                      <TouchableOpacity onPress={() => removeStep(index)}>
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      value={step.step_description}
                      onChangeText={(text) => updateStep(index, "step_description", text)}
                      placeholder="Step description"
                      placeholderTextColor={theme.icon}
                      multiline
                      style={[s.textArea, { color: theme.text, borderColor: theme.border }]}
                    />

                    <TextInput
                      value={step.office_location}
                      onChangeText={(text) => updateStep(index, "office_location", text)}
                      placeholder="Office location (optional)"
                      placeholderTextColor={theme.icon}
                      style={[s.input, { color: theme.text, borderColor: theme.border }]}
                    />

                    <TextInput
                      value={step.reference_link}
                      onChangeText={(text) => updateStep(index, "reference_link", text)}
                      placeholder="Reference link (optional)"
                      placeholderTextColor={theme.icon}
                      style={[s.input, { color: theme.text, borderColor: theme.border }]}
                    />
                  </View>
                ))}
              </>
            ) : (
              <>
                {/* FAQ TAB — category only, FAQs added later */}
                <View style={[s.infoBox, { borderColor: theme.border }]}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.tint} />
                  <Text style={[s.infoText, { color: theme.icon }]}>
                    Individual FAQs can't be added here. Once this process is created,
                    a matching FAQ category will appear on the FAQ page where you can
                    add questions and answers for it.
                  </Text>
                </View>

                <Text style={[s.label, { color: theme.text }]}>FAQ Category Name</Text>
                <TextInput
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder={procedureName || "Defaults to the procedure name"}
                  placeholderTextColor={theme.icon}
                  style={[s.input, { color: theme.text, borderColor: theme.border }]}
                />
              </>
            )}

            {error ? <Text style={s.errorText}>{error}</Text> : null}

            <View style={{ height: 8 }} />
          </ScrollView>

          {/* ACTIONS */}
          <View style={s.buttonContainer}>
            <TouchableOpacity
              style={[s.cancelButton, { borderColor: theme.border }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[s.cancelText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.saveButton, { backgroundColor: theme.tint }, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.saveText}>Create Process</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "88%",
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
  },
  title: { fontSize: 20, marginBottom: 4 },
  subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 16 },

  tabRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: { fontWeight: "600" },

  scroll: { maxHeight: 420 },

  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 70,
    textAlignVertical: "top",
    fontSize: 14,
    marginBottom: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },

  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },

  removeBtn: { padding: 4 },

  stepCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },

  stepCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  stepNumber: { fontWeight: "700" },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    alignItems: "flex-start",
  },

  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 12,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "600" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});