import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../constants/theme";

export default function DocList({ icon, text }: any) {
  const [checked, setChecked] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>

      {/* ICON BADGE */}
      <View style={styles.badge}>
        <MaterialIcons name={icon} size={18} color="#fff" />
      </View>

      {/* TEXT */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
      </View>

      {/* CIRCULAR CHECKBOX */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: colors.icon },
          checked && { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint }
        ]}
        onPress={() => setChecked(!checked)}
      >
        {checked && <MaterialIcons name="check" size={14} color="#fff" />}
      </TouchableOpacity>

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

  textContainer: {
    flex: 1,
  },

  text: {
    fontWeight: "600",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 11, // 👈 makes it a circle
    justifyContent: "center",
    alignItems: "center",
  },
});