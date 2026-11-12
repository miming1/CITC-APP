import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

import { Colors } from "../../constants/theme";

interface Props {
  activeTab: "procedure" | "faq";
  setActiveTab: (tab: "procedure" | "faq") => void;
}

export default function TabSwitcher({
  activeTab,
  setActiveTab,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tab,
          activeTab === "procedure" && {
            borderBottomColor: colors.tint,
          },
        ]}
        onPress={() => setActiveTab("procedure")}
      >
        <Text
          style={[
            styles.text,
            {
              color:
                activeTab === "procedure"
                  ? colors.text
                  : colors.icon,
              fontWeight:
                activeTab === "procedure"
                  ? "700"
                  : "500",
            },
          ]}
        >
          Procedure
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.tab,
          activeTab === "faq" && {
            borderBottomColor: colors.tint2,
          },
        ]}
        onPress={() => setActiveTab("faq")}
      >
        <Text
          style={[
            styles.text,
            {
              color:
                activeTab === "faq"
                  ? colors.text
                  : colors.icon,
              fontWeight:
                activeTab === "faq"
                  ? "700"
                  : "500",
            },
          ]}
        >
          FAQs
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginTop: 12,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 8,

    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },

  text: {
    fontSize: 15,
  },
});