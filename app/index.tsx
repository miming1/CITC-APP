import { router } from "expo-router";
import { useState } from "react";
import {
<<<<<<< Updated upstream
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View, useColorScheme
=======
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
>>>>>>> Stashed changes
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { loginUser, registerUser } from "../lib/auth";

import AuthLogo from "../components/AuthLogo";
import AuthMessage from "../components/AuthMessage";
import AuthTabSwitcher from "../components/Authtabswitcher";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import LoginFormView from "../components/LoginFormView";
import SignupFormView from "../components/SignupFormView";
import TermsModal from "../components/TermsModal";

// =========================================================
// SCREEN
// =========================================================

export default function LoginScreen() {
<<<<<<< Updated upstream

  // Reads the device light/dark setting — same pattern as other screens
  const colorScheme = useColorScheme() ?? "light";
  const colors      = Colors[colorScheme as "light" | "dark"];

  // Brand tint — same color used in headers, badges, FAB, active tabs
  const TINT = Colors.light.tint;

  // ── State ────────────────────────────────────────────────────
  // Which form is showing: "login" or "signup"
  const [tab, setTab] = useState<"login" | "signup">("login");

  // Login form fields (controlled inputs)
  const [loginForm, setLoginForm] = useState({ idNumber: "", password: "" });

  // Sign up form fields (controlled inputs)
=======
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];
  const TINT = Colors.light.tint;

  // ── Tab ───────────────────────────────────────────────
  const [tab, setTab] = useState<"login" | "signup">("login");

  // ── Forms ─────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState({ idNumber: "", password: "" });
>>>>>>> Stashed changes
  const [signupForm, setSignupForm] = useState({
    idNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

<<<<<<< Updated upstream
  // Feedback shown below the form after submitting
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

    // loading spinner while waiting for API response
=======
  // ── State ─────────────────────────────────────────────
>>>>>>> Stashed changes
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

<<<<<<< Updated upstream
  // ── Handlers ─────────────────────────────────────────────────

  // Switch tab and clear any existing message
=======
  // ── Helpers ───────────────────────────────────────────
>>>>>>> Stashed changes
  function switchTab(t: "login" | "signup") {
    setTab(t);
    setMessage(null);
    setTermsAccepted(false);
  }

<<<<<<< Updated upstream
 // ── Login ────────────────────────────────────────────────────
  async function handleLogin() {
    const { idNumber, password } = loginForm;
    const isNumeric = /^\d+$/.test(idNumber);
 
  if (!idNumber.trim() || !password.trim()) {
    setMessage({ type: "error", text: "Please fill in all fields." });
    return;
  }
  if (!isNumeric) {
    setMessage({ type: "error", text: "ID Number must contain only numbers." });
    return;
  }
  if (idNumber.length < 8 || idNumber.length > 20) {
    setMessage({ type: "error", text: "ID Number is too short" });
    return;
  }
  if (password.length < 8 || password.length > 20) {
    setMessage({ type: "error", text: "Password is too short" });
    return;
  }

  setMessage({ type: "success", text: "Logging you in…" });
  const result = await loginUser(idNumber, password);

  if (result.success) {
    setTimeout(() => {
      setMessage(null);
      router.replace({
        pathname: "/Userdashboard",
        params: { idNumber: idNumber },
      });
    }, 700);
  } else {
    setMessage({ type: "error", text: "Invalid ID or password." });
  }
}

  // ── Sign Up ──────────────────────────────────────────────────
  async function handleSignup() {
    const { idNumber, email, password } = signupForm;
    const emailRegex = /\S+@\S+\.\S+/;
    const isNumeric  = /^\d+$/.test(idNumber);
 
  if (!idNumber || !email || !password) {
    setMessage({ type: "error", text: "Please fill in all fields." });
    return;
  }
  if (!isNumeric) {
    setMessage({ type: "error", text: "ID Number must contain only numbers." });
    return;
  }
  if (idNumber.length < 8 || idNumber.length > 20) {
    setMessage({ type: "error", text: "ID Number is too short" });
    return;
  }
  if (!emailRegex.test(email)) {
    setMessage({ type: "error", text: "Invalid email! Must include '@' and a domain (e.g., .com)." });
    return;
  }
  if (password.length < 8 || password.length > 20) {
    setMessage({ type: "error", text: "Password is too short" });
    return;
  }

  const result = await registerUser(idNumber, email, password);

  if (result.success) {
    setMessage({ type: "success", text: "Account created! You can now log in." });
    setTimeout(() => {
      setTab("login");
      setMessage(null);
    }, 1000);
  } else {
    setMessage({ type: "error", text: "Registration failed. ID may already exist." });
  }
}

  // ── Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>

      {/* Lifts the card up when the keyboard opens */}
=======
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

      if (result.success) {
        setMessage({ type: "success", text: "Login successful!" });
        setTimeout(() => {
          setMessage(null);
          if (result.role_id === 2) {
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
            {/* ── Logo ──────────────────────────────────────────
                Placeholder circle — replace with <Image> later  */}
            <View style={s.logoWrap}>
              <View style={[s.logoCircle, { backgroundColor: TINT }]}>
                <Text style={s.logoText}>CITC</Text>
              </View>
            </View>

            {/* ── Toggle pill (Login / Sign Up) ─────────────────
                White pill slides left or right based on `tab` state */}
            <View style={s.toggleWrap}>

              {/* The sliding white background pill */}
              <View style={[s.pill, tab === "signup" && s.pillRight]} />

              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => switchTab("login")}
                activeOpacity={0.8}
              >
                <Text style={[
                  s.toggleText,
                  { color: '#422780' },
                  tab === "login" && s.toggleActive,
                ]}>
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => switchTab("signup")}
                activeOpacity={0.8}
              >
                <Text style={[
                  s.toggleText,
                  { color: '#422780' },
                  tab === "signup" && s.toggleActive,
                ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>

            </View>

            {/* ── Login Form ────────────────────────────────────
                Only rendered when tab === "login"              */}
            {tab === "login" && (
              <View>

                <View style={s.field}>
                  <Text style={[s.label, { color: '#422780' }]}>ID Number</Text>
                  <TextInput
                    style={[s.input, { color: '#4b2170'}]}
                    placeholder="Enter ID Number"
                    placeholderTextColor={'#CCBACE'}
                    value={loginForm.idNumber}
                    onChangeText={(v) => setLoginForm({ ...loginForm, idNumber: v })}
                    autoCapitalize="none"
                  />
                </View>

                <View style={s.field}>
                  <Text style={[s.label, { color: '#422780' }]}>Password</Text>
                  <TextInput
                    style={[s.input, { color: '#4b2170' }]}
                    placeholder="Enter Password"
                    placeholderTextColor={'#CCBACE'}
                    value={loginForm.password}
                    onChangeText={(v) => setLoginForm({ ...loginForm, password: v })}
                    secureTextEntry
                  />
                </View>

                <Text style={[s.forgot, { color: '#5D429D' }]}>Forgot password?</Text>

                <TouchableOpacity
                  style={[s.btn, { backgroundColor: TINT }]}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                >
                  <Text style={s.btnText}>Log In</Text>
                </TouchableOpacity>

              </View>
            )}

            {/* ── Sign Up Form ──────────────────────────────────
                Only rendered when tab === "signup"            */}
            {tab === "signup" && (
              <View>

                <View style={s.field}>
                  <Text style={[s.label, { color: '#422780' }]}>ID Number</Text>
                  <TextInput
                    style={[s.input, { color: '#4b2170' }]}
                    placeholder="Enter ID Number"
                    placeholderTextColor={'#CCBACE'}
                    value={signupForm.idNumber}
                    onChangeText={(v) => setSignupForm({ ...signupForm, idNumber: v })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={s.field}>
                  <Text style={[s.label, { color: '#422780' }]}>Email</Text>
                  <TextInput
                    style={[s.input, { color: '#4b2170' }]}
                    placeholder="Enter Email Address"
                    placeholderTextColor={'#CCBACE'}
                    value={signupForm.email}
                    onChangeText={(v) => setSignupForm({ ...signupForm, email: v })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={s.field}>
                  <Text style={[s.label, { color: '#422780' }]}>Password</Text>
                  <TextInput
                    style={[s.input, { color: '#4b2170' }]}
                    placeholder="Create a Password"
                    placeholderTextColor={'#CCBACE'}
                    value={signupForm.password}
                    onChangeText={(v) => setSignupForm({ ...signupForm, password: v })}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[s.btn, { backgroundColor: TINT }]}
                  onPress={handleSignup}
                  activeOpacity={0.85}
                >
                  <Text style={s.btnText}>Create Account</Text>
                </TouchableOpacity>

                <Text style={[s.terms, { color: colors.icon }]}>
                  By signing up you agree to our Terms of Service.
                </Text>

              </View>
            )}

            {/* ── Feedback Message ──────────────────────────────*/}
            {message && (
              <View style={[s.msg, message.type === "error" ? s.msgErr : s.msgOk]}>
                <Text style={message.type === "error" ? s.msgErrText : s.msgOkText}>
                  {message.text}
                </Text>
              </View>
=======
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
>>>>>>> Stashed changes
            )}

            {message && <AuthMessage type={message.type} text={message.text} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
<<<<<<< Updated upstream
=======

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <ForgotPasswordModal visible={showForgot} onClose={() => setShowForgot(false)} />
>>>>>>> Stashed changes
    </SafeAreaView>
  );
}

<<<<<<< Updated upstream
// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe:   { flex: 1 },
=======
const s = StyleSheet.create({
  safe: { flex: 1 },
>>>>>>> Stashed changes
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    paddingVertical: 40,
  },
<<<<<<< Updated upstream

  // White card that wraps the whole form
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

  logoWrap:   { alignItems: "center", marginBottom: 24 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", color: "#D3C1FF",
  },
  logoText: { color: "#fff", fontSize: 13, fontStyle: "italic", fontWeight: "600" },

  // Light background container for the toggle pill
  toggleWrap: {
    backgroundColor: "#D3C1FF",
    borderRadius: 100,
    padding: 4,
    flexDirection: "row",
    position: "relative",
    marginBottom: 24,
  },

  // White sliding pill — sits behind the active tab label
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
  pillRight: { left: "51%" }, // slides right when Sign Up is active

  toggleBtn:    { flex: 1, paddingVertical: 10, alignItems: "center", zIndex: 1 },
  toggleText:   { fontSize: 14, fontWeight: "500" },
  toggleActive: { fontWeight: "700" },

  field: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },

  forgot: { fontSize: 12, fontWeight: "600", textAlign: "right", marginBottom: 14, marginTop: -4 },

  btn:     { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  terms: { fontSize: 11, textAlign: "center", marginTop: 14, lineHeight: 17 },

  msg:        { borderRadius: 8, padding: 10, marginTop: 14, alignItems: "center" },
  msgErr:     { backgroundColor: "#fef2f2" },
  msgOk:      { backgroundColor: "#f0fdf4" },
  msgErrText: { color: "#b91c1c", fontSize: 13 },
  msgOkText:  { color: "#15803d", fontSize: 13 },

=======
>>>>>>> Stashed changes
});