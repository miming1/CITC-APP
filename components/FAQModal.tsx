import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";

type FAQ = {
  question: string;
  answer?: string;
};

type FAQModalProps = {
  visible: boolean;
  onClose: () => void;

  onSave: (procedureId: number, data: FAQ) => void;

  initialData?: FAQ | null;
  isAdmin?: boolean;
  procedureId: number;
};

export default function FAQModal({
  visible,
  onClose,
  onSave,
  initialData,
  isAdmin = false,
  procedureId,
}: FAQModalProps) {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || "");
      setAnswer(initialData.answer || "");
    } else {
      setQuestion("");
      setAnswer("");
    }
  }, [initialData]);

  const handleSave = () => {
    if (!question.trim()) {
      Alert.alert("Missing Question", "Please enter a question.");
      return;
    }

    onSave(procedureId, {
      question,
      answer: isAdmin ? answer : "",
    });

    setQuestion("");
    setAnswer("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
          ]}
        >
          {/* TITLE */}
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontFamily: Fonts.rounded,
              },
            ]}
          >
            {isAdmin ? "Manage FAQ" : "Send a Question"}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.icon,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            {isAdmin
              ? "Create or update frequently asked questions."
              : "Submit your concern or inquiry."}
          </Text>

          {/* QUESTION */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.text }]}>
              Question
            </Text>

            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Type your question..."
              placeholderTextColor={theme.icon}
              multiline
              style={[
                styles.textArea,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "#F8F8F8",
                },
              ]}
            />
          </View>

          {/* ANSWER */}
          {isAdmin && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.text }]}>
                Answer
              </Text>

              <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type the answer..."
                placeholderTextColor={theme.icon}
                multiline
                style={[
                  styles.textArea,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "#F8F8F8",
                  },
                ]}
              />
            </View>
          )}

          {/* BUTTONS */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { borderColor: theme.border },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.tint },
              ]}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>
                {isAdmin ? "Save FAQ" : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    fontSize: 22,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 6,
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
    paddingHorizontal: 18,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "600",
  },
});