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
  // ADMIN MODE
  // =========================================================

  if (isAdmin) {
    if (isFAQTab) {
      return null
    }

    return null;
  }

  // =========================================================
  // STUDENT MODE
  // =========================================================

  const handleChatbotPress = () => {
    // TODO: Navigate to AI Assistant screen
    console.log("Chatbot pressed (not implemented yet)");
  };

  // FAQ TAB → Chat only
  if (isFAQTab) {
    return (
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.tooltip}>
            <Tooltip text="Chat with AI Assistant" />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.tint2 },
            ]}
            onPress={handleChatbotPress}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name="chat"
              size={26}
              color={theme.background}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // PROCEDURE TAB → Chat + Track
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
            { backgroundColor: theme.tint2 },
          ]}
          onPress={handleChatbotPress}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="chat"
            size={26}
            color={theme.background}
          />
        </TouchableOpacity>
      </View>

      {/* TRACK DOCUMENT BUTTON */}
      <View style={styles.wrapper}>
        <View style={styles.tooltip}>
          <Tooltip text="Track Document" />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.tint2 },
          ]}
          onPress={onTrackPress}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name="description"
            size={26}
            color={theme.background}
          />
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