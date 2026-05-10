import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import FAQCard from "../components/FAQCard";

interface Props {
  faqs: any[];
  setFaqs: (f: any[]) => void;

  procedure: any; // 🔥 NEW

  isAdmin: boolean;
  colors: any;

  onSaveFAQInline: (faq: any) => void;
  onRequestDelete: (faq: any) => void;
}

export default function FAQTab({
  faqs,
  setFaqs,
  procedure,
  isAdmin,
  colors,
  onSaveFAQInline,
  onRequestDelete,
}: Props) {
  const [editingFAQId, setEditingFAQId] = useState<number | null>(null);

  const handleEdit = (faqId: number) => {
    setEditingFAQId(faqId);
  };

  const handleCancel = () => {
    setEditingFAQId(null);
  };

  return (
    <View>
      {/* ========================= */}
      {/* PROCEDURE HEADER (NEW) */}
      {/* ========================= */}

      <Text style={[styles.title, { color: colors.text }]}>
        {procedure?.procedure_name}
      </Text>

      {procedure?.description ? (
        <Text style={[styles.description, { color: colors.icon }]}>
          {procedure.description}
        </Text>
      ) : null}

      {/* ========================= */}
      {/* FAQ TITLE */}
      {/* ========================= */}

      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Frequently Asked Questions
      </Text>

      {/* ========================= */}
      {/* LIST */}
      {/* ========================= */}

      {faqs.map((faq, index) => {
        const isEditing = editingFAQId === faq.faq_id;

        return (
          <View key={faq.faq_id} style={styles.faqWrapper}>
            {/* ACTIONS */}
            {isAdmin && !isEditing && (
              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleEdit(faq.faq_id)}>
                  <Text style={{ color: colors.tint }}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onRequestDelete(faq)}>
                  <Text style={{ color: "red" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* EDIT MODE */}
            {isEditing ? (
              <View style={styles.editCard}>
                <TextInput
                  value={faq.question}
                  onChangeText={(text) => {
                    const updated = [...faqs];
                    updated[index].question = text;
                    setFaqs(updated);
                  }}
                  multiline
                  placeholder="Question"
                  placeholderTextColor={colors.icon}
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                />

                <TextInput
                  value={faq.answer}
                  onChangeText={(text) => {
                    const updated = [...faqs];
                    updated[index].answer = text;
                    setFaqs(updated);
                  }}
                  multiline
                  placeholder="Answer"
                  placeholderTextColor={colors.icon}
                  style={[
                    styles.textArea,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                />

                <View style={styles.inlineButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={{ color: "white" }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => {
                      onSaveFAQInline(faq);
                      setEditingFAQId(null);
                    }}
                  >
                    <Text style={{ color: "white" }}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <FAQCard
                question={faq.question}
                answer={faq.answer}
                isAdmin={false}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },

  description: {
    fontSize: 14,
    marginBottom: 14,
  },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 14,
    fontSize: 18,
    fontWeight: "700",
  },

  faqWrapper: {
    marginBottom: 20,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginBottom: 6,
  },

  editCard: {
    gap: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },

  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    minHeight: 90,
    textAlignVertical: "top",
  },

  inlineButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
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