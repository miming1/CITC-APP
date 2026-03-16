import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export default function Header({ title }: { title: string }) {
  const router = useRouter();

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={[styles.icon, { color: colors.text }]}>←</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>

      <Text style={[styles.icon, { color: colors.text }]}>≡</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: Colors.light.tint,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  icon: {
    fontSize: 20,
  },
});