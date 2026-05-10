import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

import StepItem from "../components/StepItem";

interface Props {
  procedure: any;
  setProcedure: (p: any) => void;

  steps: any[];
  setSteps: (s: any[]) => void;

  requirements: any[];
  setRequirements: (r: any[]) => void;

  isAdmin: boolean;
  isEditing: boolean;

  colors: any;

  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;

  // 🔥 NEW (for ProcessScreen to sync deletes)
  setDeletedSteps?: (ids: number[]) => void;
  setDeletedRequirements?: (ids: number[]) => void;
  deletedSteps?: number[];
  deletedRequirements?: number[];
}

export default function ProcessTab({
  procedure,
  setProcedure,
  steps,
  setSteps,
  requirements,
  setRequirements,
  isAdmin,
  isEditing,
  colors,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  setDeletedSteps = () => {},
  setDeletedRequirements = () => {},
  deletedSteps = [],
  deletedRequirements = [],
}: Props) {
  const [showMenu, setShowMenu] = useState(false);

  // =========================================================
  // REQUIREMENTS
  // =========================================================
  const addRequirement = () => {
    setRequirements([
      ...requirements,
      { requirement_id: null, requirement_text: "" },
    ]);
  };

  const removeRequirement = (index: number) => {
    const req = requirements[index];

    if (req?.requirement_id) {
      setDeletedRequirements([...deletedRequirements, req.requirement_id]);
    }

    const updated = [...requirements];
    updated.splice(index, 1);
    setRequirements(updated);
  };

  // =========================================================
  // STEPS
  // =========================================================
  const addStep = () => {
    setSteps([
      ...steps,
      {
        step_id: null,
        step_number: steps.length + 1,
        step_description: "",
        office_location: "",
        reference_link: "",
      },
    ]);
  };

  const removeStep = (index: number) => {
    const step = steps[index];

    if (step?.step_id) {
      setDeletedSteps([...deletedSteps, step.step_id]);
    }

    const updated = [...steps];
    updated.splice(index, 1);

    const renumbered = updated.map((s, i) => ({
      ...s,
      step_number: i + 1,
    }));

    setSteps(renumbered);
  };

  return (
    <View style={{ position: "relative" }}>
      {/* ========================= */}
      {/* MENU */}
      {/* ========================= */}

      {isAdmin && (
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={styles.menuButton}
        >
          <Text style={[styles.menuDots, { color: colors.icon }]}>⋯</Text>
        </TouchableOpacity>
      )}

      {showMenu && isAdmin && (
        <View style={[styles.menuBox, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={onEdit}>
            <Text style={{ color: colors.text }}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete}>
            <Text style={{ color: "red" }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}

      {isEditing ? (
        <TextInput
          value={procedure?.procedure_name}
          onChangeText={(text) =>
            setProcedure({ ...procedure, procedure_name: text })
          }
          style={[
            styles.titleInput,
            { color: colors.text, borderColor: colors.border },
          ]}
        />
      ) : (
        <Text style={[styles.title, { color: colors.text }]}>
          {procedure?.procedure_name}
        </Text>
      )}

      {/* ========================= */}
      {/* DESCRIPTION */}
      {/* ========================= */}

      {isEditing ? (
        <TextInput
          value={procedure?.description || ""}
          onChangeText={(text) =>
            setProcedure({ ...procedure, description: text })
          }
          multiline
          style={[
            styles.input,
            { color: colors.text, borderColor: colors.border },
          ]}
        />
      ) : (
        <Text style={{ color: colors.icon, marginTop: 8 }}>
          {procedure?.description}
        </Text>
      )}

      {/* ========================= */}
      {/* REQUIREMENTS */}
      {/* ========================= */}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Requirements
        </Text>

        {isEditing && (
          <TouchableOpacity onPress={addRequirement}>
            <Text style={{ color: colors.tint }}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {requirements.map((req, index) => (
        <View key={req.requirement_id || index} style={styles.rowItem}>
          {isEditing ? (
            <>
              <TextInput
                value={req.requirement_text}
                onChangeText={(text) => {
                  const updated = [...requirements];
                  updated[index].requirement_text = text;
                  setRequirements(updated);
                }}
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />

              <TouchableOpacity onPress={() => removeRequirement(index)}>
                <Text style={{ color: "red" }}>Remove</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={{ color: colors.text, marginVertical: 4 }}>
              • {req.requirement_text}
            </Text>
          )}
        </View>
      ))}

      {/* ========================= */}
      {/* STEPS */}
      {/* ========================= */}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Steps
        </Text>

        {isEditing && (
          <TouchableOpacity onPress={addStep}>
            <Text style={{ color: colors.tint }}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {steps.map((step, index) => (
        <View key={step.step_id || index} style={styles.stepCard}>
          {isEditing ? (
            <>
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                Step {index + 1}
              </Text>

              <TextInput
                value={step.step_description}
                onChangeText={(text) => {
                  const updated = [...steps];
                  updated[index].step_description = text;
                  setSteps(updated);
                }}
                multiline
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />

              <TextInput
                value={step.office_location || ""}
                onChangeText={(text) => {
                  const updated = [...steps];
                  updated[index].office_location = text;
                  setSteps(updated);
                }}
                placeholder="Office location"
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />

              <TextInput
                value={step.reference_link || ""}
                onChangeText={(text) => {
                  const updated = [...steps];
                  updated[index].reference_link = text;
                  setSteps(updated);
                }}
                placeholder="Reference link"
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
              />

              <TouchableOpacity onPress={() => removeStep(index)}>
                <Text style={{ color: "red" }}>Remove Step</Text>
              </TouchableOpacity>
            </>
          ) : (
            <StepItem
              number={step.step_number}
              text={step.step_description}
              sub={step.office_location}
              link={step.reference_link}
            />
          )}
        </View>
      ))}

      {/* ========================= */}
      {/* ACTIONS */}
      {/* ========================= */}

      {isEditing && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={{ color: "white" }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
            <Text style={{ color: "white" }}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 6,
    zIndex: 10,
  },
  menuDots: {
    fontSize: 26,
    fontWeight: "700",
  },
  menuBox: {
    position: "absolute",
    top: 30,
    right: 0,
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    zIndex: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "700",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  rowItem: {
    marginBottom: 8,
  },
  stepCard: {
    marginTop: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: "#6B7280",
    padding: 10,
    borderRadius: 8,
  },
});