import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { ENDPOINTS } from "../constants/api";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Step = "email" | "otp" | "newPassword" | "done";

export default function ForgotPasswordModal({ visible, onClose }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /\S+@\S+\.\S+/;

  const handleSendOTP = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    if (!emailRegex.test(email)) return setError("Please enter a valid email address.");

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No account found with that email.");
      } else {
        setStep("otp");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (otp.length < 6) return setError("Please enter the 6-digit verification code.");

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.verifyResetOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid or expired OTP.");
      } else {
        setStep("newPassword");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setStep("done");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("email");
    setError("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable style={s.overlay} onPress={handleClose}>
          <Pressable style={s.card} onPress={() => {}}>

            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Ionicons name="chevron-back" size={20} color="#9B7FD4" />
              <Text style={s.closeText}>Forgot Password</Text>
            </TouchableOpacity>

            {step === "email" && (
              <>
                <View style={s.iconWrap}>
                  <View style={s.iconCircle}>
                    <Ionicons name="mail-outline" size={40} color="#9B7FD4" />
                  </View>
                  <View style={s.sparkle}>
                    <Ionicons name="sparkles" size={14} color="#D3C1FF" />
                  </View>
                </View>
                <Text style={s.sub}>
                  Enter your registered email address.{"\n"}
                  We will send a one-time verification code.
                </Text>
                <View style={s.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color="#CCBACE" style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="example@gmail.com"
                    placeholderTextColor="#CCBACE"
                    value={email}
                    onChangeText={(v) => { setEmail(v); setError(""); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {error ? <Text style={s.errorText}>{error}</Text> : null}
                <TouchableOpacity
                  style={[s.btn, (!email.trim() || loading) && s.btnDisabled]}
                  onPress={handleSendOTP}
                  disabled={!email.trim() || loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send OTP</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === "otp" && (
              <>
                <View style={s.iconWrap}>
                  <View style={s.iconCircle}>
                    <Ionicons name="keypad-outline" size={40} color="#9B7FD4" />
                  </View>
                </View>
                <Text style={s.sentTitle}>Check Your Email</Text>
                <Text style={s.sub}>
                  A 6-digit OTP was sent to{"\n"}
                  <Text style={s.emailBold}>{email}</Text>
                </Text>
                <View style={s.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#CCBACE" style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#CCBACE"
                    value={otp}
                    onChangeText={(v) => { setOtp(v); setError(""); }}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
                {error ? <Text style={s.errorText}>{error}</Text> : null}
                <TouchableOpacity
                  style={[s.btn, (!otp.trim() || loading) && s.btnDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={!otp.trim() || loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify OTP</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep("email")} style={s.cancelWrap}>
                  <Text style={s.cancel}>Change Email</Text>
                </TouchableOpacity>
              </>
            )}

            {step === "newPassword" && (
              <>
                <View style={s.iconWrap}>
                  <View style={s.iconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={40} color="#9B7FD4" />
                  </View>
                </View>
                <Text style={s.sentTitle}>Set New Password</Text>
                <Text style={s.sub}>Choose a strong password for your account.</Text>

                <View style={s.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color="#CCBACE" style={s.inputIcon} />
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="New Password"
                    placeholderTextColor="#CCBACE"
                    value={newPassword}
                    onChangeText={(v) => { setNewPassword(v); setError(""); }}
                    secureTextEntry={!showNew}
                  />
                  <TouchableOpacity onPress={() => setShowNew((p) => !p)}>
                    <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={18} color="#CCBACE" />
                  </TouchableOpacity>
                </View>

                <View style={[s.inputWrap, { marginTop: 8 }]}>
                  <Ionicons name="lock-closed-outline" size={18} color="#CCBACE" style={s.inputIcon} />
                  <TextInput
                    style={[s.input, { flex: 1 }]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#CCBACE"
                    value={confirmPassword}
                    onChangeText={(v) => { setConfirmPassword(v); setError(""); }}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color="#CCBACE" />
                  </TouchableOpacity>
                </View>

                {error ? <Text style={s.errorText}>{error}</Text> : null}
                <TouchableOpacity
                  style={[s.btn, loading && s.btnDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Reset Password</Text>}
                </TouchableOpacity>
              </>
            )}

            {step === "done" && (
              <>
                <View style={s.iconWrap}>
                  <View style={[s.iconCircle, s.sentCircle]}>
                    <Ionicons name="checkmark-circle-outline" size={40} color="#5D429D" />
                  </View>
                </View>
                <Text style={s.sentTitle}>Password Reset!</Text>
                <Text style={s.sub}>
                  Your password has been successfully changed.{"\n"}
                  You can now log in with your new password.
                </Text>
                <TouchableOpacity style={s.btn} onPress={handleClose}>
                  <Text style={s.btnText}>Back to Login</Text>
                </TouchableOpacity>
              </>
            )}

            {step !== "done" && (
              <TouchableOpacity onPress={handleClose} style={s.cancelWrap}>
                <Text style={s.cancel}>Cancel</Text>
              </TouchableOpacity>
            )}

          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    paddingTop: 20,
    width: "100%",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    gap: 4,
  },
  closeText: { fontSize: 16, fontWeight: "700", color: "#422780" },
  iconWrap: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F3EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sentCircle: { backgroundColor: "#EFF7EE" },
  sparkle: { position: "absolute", top: 0, right: -8 },
  sub: { fontSize: 13, color: "#6B5A8E", lineHeight: 20, marginBottom: 20, textAlign: "center" },
  sentTitle: { fontSize: 20, fontWeight: "700", color: "#422780", marginBottom: 10 },
  emailBold: { fontWeight: "700", color: "#422780" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#E0D5F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#4b2170", paddingVertical: 0 },
  errorText: { color: "#b91c1c", fontSize: 12, marginBottom: 10, alignSelf: "flex-start" },
  btn: {
    width: "100%",
    backgroundColor: "#9B7FD4",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelWrap: { marginTop: 14, paddingVertical: 4 },
  cancel: { color: "#9B7FD4", fontSize: 14, fontWeight: "600" },
});