import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../constants/theme";
import { loginUser, registerUser } from "../lib/auth";

import AuthLogo from "../components/AuthLogo";
import AuthMessage from "../components/AuthMessage";
import AuthTabSwitcher from "../components/AuthTabSwitcher";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import LoginFormView from "../components/LoginFormView";
import SignupFormView from "../components/SignupFormView";
import TermsModal from "../components/TermsModal";


// =========================================================
// SCREEN
// =========================================================

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];
  const TINT = Colors.light.tint;

  // ── Tab ───────────────────────────────────────────────
  const [tab, setTab] = useState<"login" | "signup">("login");

  // ── Forms ─────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ idNumber: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    idNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ── State ─────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // ── Helpers ───────────────────────────────────────────
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
        setMessage({ type: "success", text: "Login successful!" });
        setTimeout(() => {
          setMessage(null);
          if (roleId === 2) {
            router.replace({ pathname: "/AdminDashboard", params: { idNumber } });
          } else {
            router.replace({ pathname: "/Userdashboard", params: { idNumber } });
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

  // ── Signup ────────────────────────────────────────────
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
      const result = await registerUser(idNumber, email, password);

      if (result.success) {
        setMessage({ type: "success", text: "Account created successfully!" });
        setTimeout(() => {
          switchTab("login");
        }, 1000);
      } else {
        setMessage({ type: "error", text: result.error || "Registration failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────
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
});