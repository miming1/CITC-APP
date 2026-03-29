import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export default function Home() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>CITC Academic Procedure Portal</Text>

      <Pressable
        onPress={() => {
          console.log("clicked"); // debug
          router.push("/process");
        }}
        style={[styles.button]}
      >
        <Text style={{ color: "white" }}>
          Check Available Procedure
        </Text>
      </Pressable>
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
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
});