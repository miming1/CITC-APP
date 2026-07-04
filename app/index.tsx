import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { loginUser } from "../lib/auth";
import { useAuth } from "../lib/auth-context";

import AuthLogo from "../components/AuthLogo";
import AuthMessage from "../components/AuthMessage";
import AuthTabSwitcher from "../components/AuthTabSwitcher";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import LoginFormView from "../components/LoginFormView";
import SignupFormView from "../components/SignupFormView";
import TermsModal from "../components/TermsModal";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];
  const TINT = Colors.light.tint;

  const { setUser } = useAuth();

  const [tab, setTab] = useState<"login" | "signup">("login");

  const [loginForm, setLoginForm] = useState({ idNumber: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    idNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  function switchTab(t: "login" | "signup") {
    setTab(t);
    setMessage(null);
    setTermsAccepted(false);
  }

  function updateLogin(field: keyof typeof loginForm, value: string) {
    setLoginForm((p) => ({ ...p, [field]: value }));
  }

  function updateSignup(field: keyof typeof signupForm, value: string) {
    setSignupForm((p) => ({ ...p, [field]: value }));
  }

  // ── Login ─────────────────────────────────────────────
  async function handleLogin() {
    const { idNumber, password } = loginForm;
    const isNumeric = /^\d+$/.test(idNumber);

    if (!idNumber.trim() || !password.trim())
      return setMessage({ type: "error", text: "Please fill in all fields." });
    if (!isNumeric)
      return setMessage({ type: "error", text: "ID Number must contain only numbers." });
    if (idNumber.length < 8 || idNumber.length > 20)
      return setMessage({ type: "error", text: "Invalid ID Number length." });
    if (password.length < 8)
      return setMessage({ type: "error", text: "Password is too short." });

    try {
      setLoading(true);
      setMessage({ type: "success", text: "Logging you in..." });

      const result = await loginUser(idNumber, password);
      const roleId = (result as any).role_id;

      if (result.success) {
        // Store the logged-in user once — every screen reads from context now
        setUser({ idNumber, roleId });

        setMessage({ type: "success", text: "Login successful!" });
        setTimeout(() => {
          setMessage(null);
          if (roleId === 2) {
            router.replace("/AdminDashboard");
          } else {
            router.replace("/Userdashboard");
          }
        }, 700);
      } else {
        setMessage({ type: "error", text: result.error || "Invalid ID or password." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // ── Signup Step 1: Send OTP ────────────────────────────
  async function handleSignup() {
    const { idNumber, email, password, confirmPassword } = signupForm;
    const emailRegex = /\S+@\S+\.\S+/;
    const isNumeric = /^\d+$/.test(idNumber);

    if (!idNumber || !email || !password || !confirmPassword)
      return setMessage({ type: "error", text: "Please fill in all fields." });
    if (!isNumeric)
      return setMessage({ type: "error", text: "ID Number must contain only numbers." });
    if (idNumber.length < 8 || idNumber.length > 20)
      return setMessage({ type: "error", text: "Invalid ID Number length." });
    if (!emailRegex.test(email))
      return setMessage({ type: "error", text: "Invalid email format." });
    if (password.length < 8)
      return setMessage({ type: "error", text: "Password must be at least 8 characters." });
    if (password !== confirmPassword)
      return setMessage({ type: "error", text: "Passwords do not match." });
    if (!termsAccepted)
      return setMessage({ type: "error", text: "Please accept the Terms & Conditions." });

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(ENDPOINTS.sendSignupOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_number: idNumber,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to send OTP." });
      } else {
        setOtp("");
        setOtpError("");
        setShowOtpModal(true);
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // ── Signup Step 2: Verify OTP ─────────────────────────
  async function handleVerifyOtp() {
    if (otp.length < 6) {
      return setOtpError("Please enter the 6-digit OTP.");
    }

    try {
      setOtpLoading(true);
      setOtpError("");

      const res = await fetch(ENDPOINTS.verifySignupOtp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupForm.email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || "Invalid or expired OTP.");
      } else {
        setShowOtpModal(false);
        setSignupForm({ idNumber: "", email: "", password: "", confirmPassword: "" });
        setTermsAccepted(false);
        setOtp("");
        setMessage({ type: "success", text: "Account created successfully!" });
        setTimeout(() => {
          switchTab("login");
          setMessage(null);
        }, 1000);
      }
    } catch {
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <AuthLogo />

            <AuthTabSwitcher active={tab} onChange={switchTab} />

            {tab === "login" ? (
              <LoginFormView
                form={loginForm}
                onChange={updateLogin}
                onSubmit={handleLogin}
                onForgotPassword={() => setShowForgot(true)}
                loading={loading}
                tint={TINT}
              />
            ) : (
              <SignupFormView
                form={signupForm}
                onChange={updateSignup}
                onSubmit={handleSignup}
                onViewTerms={() => setShowTerms(true)}
                termsAccepted={termsAccepted}
                onToggleTerms={() => setTermsAccepted((p) => !p)}
                loading={loading}
                tint={TINT}
              />
            )}

            {message && <AuthMessage type={message.type} text={message.text} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <ForgotPasswordModal visible={showForgot} onClose={() => setShowForgot(false)} />

      <Modal
        visible={showOtpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOtpModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable style={s.overlay} onPress={() => setShowOtpModal(false)}>
            <Pressable style={s.otpCard} onPress={() => {}}>

              <TouchableOpacity style={s.closeBtn} onPress={() => setShowOtpModal(false)}>
                <Ionicons name="chevron-back" size={20} color="#0a1036" />
                <Text style={s.closeBtnText}>Verify Email</Text>
              </TouchableOpacity>

              <View style={s.iconCircle}>
                <Ionicons name="keypad-outline" size={40} color="#0a1036" />
              </View>

              <Text style={s.otpTitle}>Check Your Email</Text>
              <Text style={s.otpSub}>
                A 6-digit OTP was sent to{"\n"}
                <Text style={s.otpEmail}>{signupForm.email}</Text>
              </Text>

              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color="#0a1036" style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#0a1036"
                  value={otp}
                  onChangeText={(v) => { setOtp(v); setOtpError(""); }}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              {otpError ? <Text style={s.errorText}>{otpError}</Text> : null}

              <TouchableOpacity
                style={[s.btn, (otp.length < 6 || otpLoading) && s.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={otp.length < 6 || otpLoading}
              >
                {otpLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnText}>Verify OTP</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={s.resendWrap}
                onPress={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setOtpError("");
                }}
              >
                <Text style={s.resend}>Change Email</Text>
              </TouchableOpacity>

            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  otpCard: {
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
  closeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#422780",
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F3EEFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a1036",
    marginBottom: 10,
  },
  otpSub: {
    fontSize: 13,
    color: "#0a1036",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  otpEmail: {
    fontWeight: "700",
    color: "#0a1036",
  },
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
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0a1036",
    paddingVertical: 0,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
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
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  resendWrap: {
    marginTop: 14,
    paddingVertical: 4,
  },
  resend: {
    color: "#9B7FD4",
    fontSize: 14,
    fontWeight: "600",
  },
});