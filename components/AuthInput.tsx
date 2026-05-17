import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function AuthInput({
  label,
  value,
  onChangeText,
  placeholder = "",
  secure = false,
  keyboardType = "default",
  autoCapitalize = "none",
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        <TextInput
          style={[s.input, secure && s.inputWithIcon]}
          placeholder={placeholder}
          placeholderTextColor="#CCBACE"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secure && (
          <TouchableOpacity
            style={s.eyeBtn}
            onPress={() => setShow((p) => !p)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={show ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#CCBACE"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  field: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#422780",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrap: { position: "relative" },
  input: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#4b2170",
  },
  inputWithIcon: { paddingRight: 44 },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});