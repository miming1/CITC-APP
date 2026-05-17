import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AuthInput from "./AuthInput";

interface LoginForm {
  idNumber: string;
  password: string;
}

interface Props {
  form: LoginForm;
  onChange: (field: keyof LoginForm, value: string) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  loading: boolean;
  tint: string;
}

export default function LoginFormView({
  form,
  onChange,
  onSubmit,
  onForgotPassword,
  loading,
  tint,
}: Props) {
  return (
    <View>
      <AuthInput
        label="ID Number"
        value={form.idNumber}
        onChangeText={(v) => onChange("idNumber", v)}
        placeholder="Enter ID Number"
        keyboardType="numeric"
      />
      <AuthInput
        label="Password"
        value={form.password}
        onChangeText={(v) => onChange("password", v)}
        placeholder="Enter Password"
        secure
      />
      <TouchableOpacity onPress={onForgotPassword} style={s.forgotWrap}>
        <Text style={s.forgot}>Forgot password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: tint }, loading && s.btnDisabled]}
        onPress={onSubmit}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Log In</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  forgotWrap: { alignItems: "flex-end", marginBottom: 14, marginTop: -4 },
  forgot: { fontSize: 12, fontWeight: "600", color: "#5D429D" },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    minHeight: 50,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});