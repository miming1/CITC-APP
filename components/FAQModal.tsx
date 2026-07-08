import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
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
  procedureId: number;
};

export default function FAQModal({
  visible,
  onClose,
  onSave,
  initialData,
  procedureId,
}: FAQModalProps) {

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question ?? "");
      setAnswer(initialData.answer ?? "");
    } else {
      setQuestion("");
      setAnswer("");
    }
  }, [initialData]);


  const handleSave = () => {

    if (!question.trim()) {
      return;
    }

    onSave(procedureId, {
      question,
      answer,
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
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >

          <View style={styles.header}>

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "#3A2C12"
                      : "#FEF3C7",
                },
              ]}
            >
              <MaterialIcons
                name="help-outline"
                size={28}
                color={colors.tint2}
              />
            </View>


            <View style={styles.headerText}>

              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    fontFamily: Fonts.rounded,
                  },
                ]}
              >
                {initialData
                  ? "Edit FAQ"
                  : "Create FAQ"}
              </Text>


              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.icon,
                  },
                ]}
              >
                Manage frequently asked questions for this procedure.
              </Text>

            </View>

          </View>



          <View style={styles.section}>

            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Question
            </Text>


            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Enter question..."
              placeholderTextColor={colors.icon}
              multiline
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                },
              ]}
            />

          </View>



          <View style={styles.section}>

            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                },
              ]}
            >
              Answer
            </Text>


            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="Enter answer..."
              placeholderTextColor={colors.icon}
              multiline
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "#F8FAFC",
                },
              ]}
            />

          </View>



          <View style={styles.buttons}>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: colors.border,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>



            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.tint,
                },
              ]}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>
                Save FAQ
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


  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },


  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },


  headerText: {
    flex: 1,
  },


  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },


  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },


  section: {
    marginBottom: 18,
  },


  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },


  textArea: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 110,
    textAlignVertical: "top",
    fontSize: 15,
  },


  buttons: {
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
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

});