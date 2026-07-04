import { MaterialIcons } from "@expo/vector-icons";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "../constants/theme";

interface StepItemProps {
  number: number;
  text: string;
  sub?: string;
  link?: string;
  checked: boolean;
  onToggle: () => void;
}

export default function StepItem({
  number,
  text,
  sub,
  link,
  checked,
  onToggle,
}: StepItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const checkColor =
    colorScheme === "light"
      ? "#141A73"
      : "#EBA937";

  const handleOpenLink = async () => {
    if (!link) return;

    let formatted = link;

    // Auto-fix missing https://
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
      {/* CHECKBOX */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: checkColor,
            backgroundColor: checked
              ? checkColor
              : "transparent",
          },
        ]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        {checked && (
          <MaterialIcons
            name="check"
            size={18}
            color="#FFFFFF"
          />
        )}
      </TouchableOpacity>

      {/* STEP NUMBER */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: colors.tint,
          },
        ]}
      >
        <Text style={styles.badgeText}>{number}</Text>
      </View>

      {/* STEP CONTENT */}
      <View
        style={[
          styles.textContainer,
          checked && styles.completed,
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: colors.text },
          ]}
        >
          {text}
        </Text>

        {sub ? (
          <Text
            style={[
              styles.sub,
              { color: colors.icon },
            ]}
          >
            {sub}
          </Text>
        ) : null}

        {link ? (
          <TouchableOpacity onPress={handleOpenLink}>
            <Text
              style={[
                styles.link,
                checked && styles.completed,
              ]}
            >
              {link}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },

  badgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  text: {
    fontWeight: "500",
    fontSize: 15,
  },

  sub: {
    fontSize: 12,
    marginTop: 3,
  },

  link: {
    fontSize: 12,
    marginTop: 6,
    color: "#3B82F6",
    textDecorationLine: "underline",
  },

  completed: {
    opacity: 0.6,
  },
});