import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>CITC Academic Procedure Portal</Text>

      <Button
        title="Check Available Procedure"
        onPress={() => router.push("/process")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});