import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { useState } from "react";
import { Colors } from "../../constants/theme";

interface Props {
  question: string;
  answer: string;
}

export default function FAQCard({
  question,
  answer,
}: Props) {

  const [open, setOpen] = useState(false);

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.questionRow}
        onPress={() => setOpen((prev) => !prev)}
      >
        <View style={styles.questionContent}>
          <View
            style={[
              styles.accentBar,
              {
                backgroundColor: colors.tint2,
              },
            ]}
          />

          <Text
            style={[
              styles.question,
              {
                color: colors.text,
              },
            ]}
          >
            {question}
          </Text>
        </View>

        <MaterialIcons
          name={
            open
              ? "keyboard-arrow-up"
              : "keyboard-arrow-down"
          }
          size={28}
          color={colors.tint}
        />
      </TouchableOpacity>


      {open && (
        <View
          style={[styles.answerContainer]}
        >
          <Text
            style={[
              styles.answer,
              {
                color: colors.icon,
              },
            ]}
          >
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({

  card: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    padding: 14,
    overflow: "hidden",
  },


  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },


  questionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },


  accentBar: {
    width: 5,
    height: "100%",
    minHeight: 28,
    borderRadius: 10,
    marginRight: 12,
  },


  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },


  answerContainer: {
    marginTop: 14,
    borderRadius: 12,
    padding: 14,
  },


  answer: {
    fontSize: 14,
    lineHeight: 21,
  },

});