import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Tab = "login" | "signup";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function AuthTabSwitcher({ active, onChange }: Props) {
  return (
    <View style={s.wrap}>
      <View style={[s.pill, active === "signup" && s.pillRight]} />
      <TouchableOpacity style={s.btn} onPress={() => onChange("login")} activeOpacity={0.8}>
        <Text style={[s.text, active === "login" && s.active]}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={() => onChange("signup")} activeOpacity={0.8}>
        <Text style={[s.text, active === "signup" && s.active]}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: "#D3C1FF",
    borderRadius: 100,
    padding: 4,
    flexDirection: "row",
    position: "relative",
    marginBottom: 24,
  },
  pill: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "50%",
    height: "98%",
    backgroundColor: "#fff",
    borderRadius: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pillRight: { left: "51%" },
  btn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#422780",
  },
  active: { fontWeight: "700" },
});