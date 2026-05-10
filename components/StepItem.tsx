import { useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../constants/theme";

export default function StepItem({
  number,
  text,
  sub,
  link,
}: any) {
  const [checked, setChecked] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const handleOpenLink = async () => {
    if (!link) return;

    let formatted = link;

    // auto-fix missing https
    if (
      !formatted.startsWith("http://") &&
      !formatted.startsWith("https://")
    ) {
      formatted = "https://" + formatted;
    }

    try {
      await Linking.openURL(formatted);
    } catch (err) {
      console.log("Failed to open link:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* STEP NUMBER */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{number}</Text>
      </View>

      {/* CONTENT */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: colors.text }]}>
          {text}
        </Text>

        {sub ? (
          <Text style={[styles.sub, { color: colors.icon }]}>
            {sub}
          </Text>
        ) : null}

        {/* CLICKABLE LINK */}
        {link ? (
          <TouchableOpacity onPress={handleOpenLink}>
            <Text style={styles.link}>
              {link}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* CHECKBOX */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: colors.icon },
          checked && styles.checked,
        ]}
        onPress={() => setChecked(!checked)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginTop: 2,
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
    marginTop: 2,
  },

  link: {
    fontSize: 12,
    marginTop: 6,
    color: "#3B82F6",
    textDecorationLine: "underline",
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    marginTop: 4,
  },

  checked: {
    backgroundColor: Colors.light.tint,
  },
});