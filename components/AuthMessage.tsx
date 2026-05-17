import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  type: "error" | "success";
  text: string;
};

export default function AuthMessage({ type, text }: Props) {
  const containerStyle = [
    styles.container,
    type === "error" ? styles.error : styles.success,
  ];

  return (
    <View style={containerStyle}>
      <Text style={type === "error" ? styles.errorText : styles.successText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    backgroundColor: "#FDECEA",
  },
  success: {
    backgroundColor: "#ECFDF3",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
  },
  successText: {
    color: "#065F46",
    fontSize: 14,
  },
});