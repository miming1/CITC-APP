import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  status?: string;
};

export default function StatusBadge({ status }: Props) {
  const lower = status?.toLowerCase();

  const badgeStyle =
    lower === "approved"
      ? styles.approved
      : lower === "rejected"
      ? styles.rejected
      : styles.pending;

  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={styles.text}>
        {status
          ? status.charAt(0).toUpperCase() + status.slice(1)
          : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 2,
  },

  text: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },

  approved: {
    backgroundColor: "#16A34A",
  },

  rejected: {
    backgroundColor: "#DC2626",
  },

  pending: {
    backgroundColor: "#D97706",
  },
});