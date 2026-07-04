import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthInput from "./AuthInput";

interface SignupForm {
  idNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  form: SignupForm;
  onChange: (field: keyof SignupForm, value: string) => void;
  onSubmit: () => void;
  onViewTerms: () => void;
  termsAccepted: boolean;
  onToggleTerms: () => void;
  loading: boolean;
  tint: string;
}

export default function SignupFormView({
  form,
  onChange,
  onSubmit,
  onViewTerms,
  termsAccepted,
  onToggleTerms,
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
        autoComplete="username" 
        textContentType="username"
      />
      <AuthInput
        label="Email"
        value={form.email}
        onChangeText={(v) => onChange("email", v)}
        placeholder="Enter Email Address"
        keyboardType="email-address"
        autoComplete="email" 
        textContentType="emailAddress" 
      />
      <AuthInput
        label="Password"
        value={form.password}
        onChangeText={(v) => onChange("password", v)}
        placeholder="Create a Password"
        secure
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AuthInput
        label="Confirm Password"
        value={form.confirmPassword}
        onChangeText={(v) => onChange("confirmPassword", v)}
        placeholder="Re-enter Password"
        secure
        autoComplete="new-password"
        textContentType="newPassword"
      />

      {/* Terms checkbox */}
      <TouchableOpacity style={s.checkRow} onPress={onToggleTerms} activeOpacity={0.7}>
        <View style={[s.checkbox, termsAccepted && { backgroundColor: tint, borderColor: tint }]}>
          {termsAccepted && <Ionicons name="checkmark" size={13} color="#fff" />}
        </View>
        <Text style={s.checkLabel}>
          I have read and accepted the{" "}
          <Text style={[s.link, { color: tint }]} onPress={onViewTerms}>
            Terms &amp; Conditions
          </Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          s.btn,
          { backgroundColor: tint },
          (loading || !termsAccepted) && s.btnDisabled,
        ]}
        onPress={onSubmit}
        activeOpacity={0.85}
        disabled={loading || !termsAccepted}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <Text style={s.termsNote}>
        By signing up you agree to our Terms of Service.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkLabel: {
    flex: 1,
    fontSize: 12,
    color: "#5D429D",
    lineHeight: 18,
  },
  link: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    minHeight: 50,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  termsNote: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 17,
    color: "#9B7FD4",
  },
});