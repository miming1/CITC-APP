import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../constants/theme";

export default function TabSwitcher({ activeTab, setActiveTab }: any) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "procedure" && styles.active,
        ]}
        onPress={() => setActiveTab("procedure")}
      >
        <Text style={[styles.text, { color: colors.text }]}>Procedure</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "faq" && styles.active,
        ]}
        onPress={() => setActiveTab("faq")}
      >
        <Text style={[styles.text, { color: colors.text }]}>FAQs</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },

  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },

  active: {
    borderBottomWidth: 3,
    borderColor: Colors.light.tint,
  },

  text: {
    fontWeight: "500",
  },
});