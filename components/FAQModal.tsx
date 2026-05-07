import { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FAQ = {
  question: string;
  answer?: string;
};

type FAQModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: FAQ) => void;
  initialData?: FAQ | null;

  // NEW
  isAdmin?: boolean;
};

export default function FAQModal({
  visible,
  onClose,
  onSave,
  initialData,
  isAdmin = false,
}: FAQModalProps) {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

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
      alert("Please enter a question.");
      return;
    }

    onSave({
      question,
      answer: isAdmin ? answer : "",
    });

    setQuestion("");
    setAnswer("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 15,
            }}
          >
            {isAdmin ? "Manage FAQ" : "Send a Question"}
          </Text>

          {/* QUESTION */}
          <Text style={{ marginBottom: 5 }}>Question</Text>

          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Type your question..."
            multiline
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 10,
              minHeight: 100,
              textAlignVertical: "top",
              marginBottom: 15,
            }}
          />

          {/* ANSWER - ADMIN ONLY */}
          {isAdmin && (
            <>
              <Text style={{ marginBottom: 5 }}>Answer</Text>

              <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type the answer..."
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  padding: 10,
                  minHeight: 100,
                  textAlignVertical: "top",
                  marginBottom: 15,
                }}
              />
            </>
          )}

          {/* BUTTONS */}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: "#3580d6",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {isAdmin ? "Save FAQ" : "Submit Question"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              alignItems: "center",
              padding: 10,
            }}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}