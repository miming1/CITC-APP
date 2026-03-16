import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export default function FAQCard({ question, answer }: any) {

  const [open, setOpen] = useState(false);

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];

  return (
    <View
      style={[
        styles.card,
        { borderColor: colors.icon, backgroundColor: colors.background }
      ]}
    >

      <TouchableOpacity
        style={styles.questionRow}
        onPress={() => setOpen(!open)}
      >
        <Text style={[styles.question, { color: colors.text }]}>
          {question}
        </Text>

        <Text style={{ color: colors.text }}>
          {open ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {open && (
        <Text style={[styles.answer, { color: colors.icon }]}>
          {answer}
        </Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
  },

  questionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  question: {
    fontWeight: "500",
  },

  answer: {
    marginTop: 10,
  },
});