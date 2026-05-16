import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors } from "../constants/theme";
import Tooltip from "./ToolTip";

type FloatingButtonsProps = {
  activeTab: "procedure" | "faq";
  isAdmin?: boolean;

  onTrackPress: () => void;
  onFAQPress: () => void;
};

export default function FloatingButtons({
  activeTab,
  isAdmin = false,
  onTrackPress,
  onFAQPress,
}: FloatingButtonsProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const isFAQTab = activeTab === "faq";

  // =========================================================
  // ADMIN RULES
  // =========================================================

  if (isAdmin) {
    if (isFAQTab) {
      return (
        <View style={styles.container}>
          <View style={styles.wrapper}>
            <View style={styles.tooltip}>
              <Tooltip text="Add FAQ" />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.tint },
              ]}
              onPress={onFAQPress}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  }

  // =========================================================
  // USER MODE
  // =========================================================

  const secondTooltip = isFAQTab
    ? "Send a Question"
    : "Track Document";

  const secondIcon = isFAQTab
    ? "send"
    : "description";

  const handleChatbotPress = () => {
    // TODO: replace with navigation when chatbot screen exists
    console.log("Chatbot pressed (not implemented yet)");
  };

  const handleSecondButton = () => {
    if (isFAQTab) {
      onFAQPress();
    } else {
      onTrackPress();
    }
  };

  return (
    <View style={styles.container}>
      {/* CHATBOT BUTTON */}
      <View style={styles.wrapper}>
        <View style={styles.tooltip}>
          <Tooltip text="Chat with AI Assistant" />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.tint },
          ]}
          onPress={handleChatbotPress}
          activeOpacity={0.85}
        >
          <MaterialIcons name="chat" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* SECOND BUTTON */}
      <View style={styles.wrapper}>
        <View style={styles.tooltip}>
          <Tooltip text={secondTooltip} />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.tint },
          ]}
          onPress={handleSecondButton}
          activeOpacity={0.85}
        >
          <MaterialIcons name={secondIcon as any} size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 24,
    bottom: 40,
    alignItems: "flex-end",
  },

  wrapper: {
    marginBottom: 18,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  tooltip: {
    position: "absolute",
    right: 70,
  },

  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});