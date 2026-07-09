import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import FAQCard from "../components/FAQCard";

interface Props {
  faqs: any[];
  setFaqs: (f: any[]) => void;

  procedure: any;

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

  const [editingFAQ, setEditingFAQ] = useState<any>(null);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const handleEdit = (faqId: number) => {
    setEditingFAQId(faqId);
  };

  const handleCancel = () => {
    setEditingFAQId(null);
    setEditingFAQ(null);
  };

  return (
    <View
      style={[
        styles.container,
        isDesktop && styles.desktopContainer,
      ]}
    >
      {/* ========================= */}
      {/* PROCEDURE HEADER */}
      {/* ========================= */}

      <Text style={[styles.title, { color: colors.text }]}>
        {procedure?.procedure_name}
      </Text>

      {procedure?.description ? (
        <Text
          style={[
            styles.description,
            { color: colors.icon },
          ]}
        >
          {procedure.description}
        </Text>
      ) : null}

      {/* ========================= */}
      {/* FAQ TITLE */}
      {/* ========================= */}

      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text },
        ]}
      >
        Frequently Asked Questions
      </Text>

      {/* ========================= */}
      {/* EMPTY STATE (NEW) */}
      {/* ========================= */}

      {faqs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No FAQs available
          </Text>

          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            This category doesn’t have any questions yet.
          </Text>
        </View>
      ) : (
        faqs.map((faq, index) => {
          const isEditing = editingFAQId === faq.faq_id;

          return (
            <View key={faq.faq_id} style={styles.faqWrapper}>
              {/* ACTIONS */}
              {isAdmin && !isEditing && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingFAQId(faq.faq_id);
                      setEditingFAQ({ ...faq });
                    }}
                  >
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
                    value={editingFAQ?.question ?? ""}
                    onChangeText={(text) => {
                      setEditingFAQ({
                        ...editingFAQ,
                        question: text,
                      });
                    }}
                    multiline
                    placeholder="Question"
                    placeholderTextColor={colors.icon}
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />

                  <TextInput
                    value={editingFAQ?.answer ?? ""}
                    onChangeText={(text) => {
                      setEditingFAQ({
                        ...editingFAQ,
                        answer: text,
                      });
                    }}
                    multiline
                    placeholder="Answer"
                    placeholderTextColor={colors.icon}
                    style={[
                      styles.textArea,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                  />

                  <View style={styles.inlineButtons}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={handleCancel}
                    >
                      <Text style={{ color: "white" }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={() => {
                        onSaveFAQInline(editingFAQ);

                        setEditingFAQId(null);
                        setEditingFAQ(null);
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
                />
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 15,
  },

  desktopContainer: {
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },

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
    marginTop: 30,
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

  // NEW EMPTY STATE
  emptyState: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});