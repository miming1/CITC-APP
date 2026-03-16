import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../constants/theme";

export default function StepItem({ number, text, sub }: any) {
  const [checked, setChecked] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{number}</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
        <Text style={[styles.sub, { color: colors.icon }]}>{sub}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: colors.icon },
          checked && styles.checked
        ]}
        onPress={() => setChecked(!checked)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "600",
  },

  textContainer: {
    flex: 1,
  },

  text: {
    fontWeight: "500",
  },

  sub: {
    fontSize: 12,
    color: "#666",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
  },

  checked: {
    backgroundColor: Colors.light.tint,
  },
});