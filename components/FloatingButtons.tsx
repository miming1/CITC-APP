import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/theme";
import Tooltip from "./ToolTip";

type FloatingButtonsProps = {
  activeTab: "procedure" | "faq";
  onTrackPress: () => void;
  onQuestionPress: () => void;
};

export default function FloatingButtons({
  activeTab,
  onTrackPress,
  onQuestionPress,
}: FloatingButtonsProps) {

  const isFAQTab = activeTab === "faq";

  const secondTooltip = isFAQTab
    ? "Send a Question"
    : "Track Document";

  const secondIcon = isFAQTab
    ? "send"
    : "description";

  const handleSecondButton = () => {
    if (isFAQTab) {
      onQuestionPress();
    } else {
      onTrackPress();
    }
  };

  return (
    <View style={styles.container}>

      {/* AI Chat */}
      <View style={styles.wrapper}>
        <View style={styles.tooltip}>
          <Tooltip text="Chat with AI Assistant" />
        </View>

        <TouchableOpacity style={styles.button}>
          <MaterialIcons
            name="chat"
            size={26}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Track Document / Send Question */}
      <View style={styles.wrapper}>
        <View style={styles.tooltip}>
          <Tooltip text={secondTooltip} />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSecondButton}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={secondIcon}
            size={26}
            color="white"
          />
        </TouchableOpacity>
      </View>

    </View>
  );
}

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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",

    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

});