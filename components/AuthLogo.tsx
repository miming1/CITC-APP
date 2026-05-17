import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/theme";

const TINT = Colors.light.tint;

export default function AuthLogo() {
  return (
    <View style={s.wrap}>
      <View style={[s.circle, { backgroundColor: TINT }]}>
        <Text style={s.text}>CITC</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "600",
  },
});