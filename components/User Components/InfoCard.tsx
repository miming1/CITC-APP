import React from "react";
import { View, StyleSheet } from "react-native";

interface InfoCardProps {
  children: React.ReactNode;
  backgroundColor: string;
  borderColor: string;
  marginHorizontal: number;
  shadow: string;
}

export default function InfoCard({
  children,
  backgroundColor,
  borderColor,
  marginHorizontal,
  shadow,
}: InfoCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          marginHorizontal,
          backgroundColor,
          borderColor,
          boxShadow: shadow,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 0.1,
    elevation: 4,
    marginTop: 25,
  },
});