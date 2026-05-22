import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Tab = "login" | "signup";

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function AuthTabSwitcher({ active, onChange }: Props) {
  return (
    <View style={s.wrap}>
      {/* Sliding pill — uses absolute positioning on native, margin trick on web */}
      {Platform.OS !== "web" ? (
        <View style={[s.pill, active === "signup" && s.pillRight]} />
      ) : (
        // On web, render the pill as a sibling inside each button wrapper instead
        null
      )}

      <TouchableOpacity
        style={[s.btn, Platform.OS === "web" && active === "login" && s.btnActiveWeb]}
        onPress={() => onChange("login")}
        activeOpacity={0.8}
      >
        {Platform.OS === "web" && active === "login" && <View style={s.pillWeb} />}
        <Text style={[s.text, active === "login" && s.active]}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.btn, Platform.OS === "web" && active === "signup" && s.btnActiveWeb]}
        onPress={() => onChange("signup")}
        activeOpacity={0.8}
      >
        {Platform.OS === "web" && active === "signup" && <View style={s.pillWeb} />}
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

  // Native: absolute-positioned sliding pill
  pill: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "50%",
    bottom: 4,
    backgroundColor: "#fff",
    borderRadius: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pillRight: { left: "50%" },

  btn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 1,
    borderRadius: 100,
    position: "relative",
    overflow: "hidden",
  },
  // Web: highlight active button with white bg directly
  btnActiveWeb: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Web pill (hidden — we use btnActiveWeb instead)
  pillWeb: {
    display: "none",
  },

  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#422780",
  },
  active: { fontWeight: "700" },
});