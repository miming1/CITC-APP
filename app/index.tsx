import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import { getRememberedId } from "../lib/tokenStore";

import ForgotPasswordModal from "../components/ForgotPasswordModal";
import TermsModal from "../components/TermsModal";

// ─── Brand tokens ───────────────────────────────────────────────
// Navy + gold, matching the CITC-APP brand palette used elsewhere in the app.
const NAVY       = "#141A73";
const NAVY_DEEP  = "#0D1354";
const GOLD       = "#EBA937";
const FIELD_BG   = "#FAF9FE";
const FIELD_BD   = "#E3E0ED";
const MUTED      = "#8B85A6";

// react-native-web renders a native focus outline on TextInputs that sits on
// top of our own focus border (that's the stray black ring). This strips it
// so only the intentional gold `inputRowFocused` border shows.
const noWebOutline =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {};

export default function LoginScreen() {

  // Reads the device light/dark setting — same pattern as other screens
  const colorScheme = useColorScheme() ?? "light";
  const colors      = Colors[colorScheme as "light" | "dark"];

  // Session context — this is what every other screen (dashboard, process,
  // profile, etc.) reads to know who's logged in and what role they have.
  const { setUser } = useAuth();

  // ── State ────────────────────────────────────────────────────
  const [tab, setTab] = useState<"login" | "signup">("login");

  const [loginForm, setLoginForm] = useState({ idNumber: "", password: "" });

  const [signupForm, setSignupForm] = useState({
    idNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  // Purely visual: tracks which input is focused so we can highlight its border.
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Purely visual: show/hide toggles for password fields.
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // In-flight flags — disable buttons and swap labels while requests run.
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Terms & Conditions (signup only)
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Forgot password (login only)
  const [showForgot, setShowForgot] = useState(false);

  // Signup OTP verification
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Pre-fill ID Number from the last successful login/signup.
  useEffect(() => {
    const saved = getRememberedId();
    if (saved) {
      setLoginForm((p) => ({ ...p, idNumber: saved }));
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────

  function switchTab(t: "login" | "signup") {
    setTab(t);
    setMessage(null);
    setTermsAccepted(false);
  }

  // Login: validate format locally → call the real Django backend via
  // lib/auth.ts (handles the correct endpoint, field names, token storage,
  // and "remembered ID" persistence) → update session context → navigate.
  async function handleLogin() {
    const { idNumber, password } = loginForm;
    const isNumeric = /^\d+$/.test(idNumber);

    if (!idNumber.trim() || !password.trim()) {
      return setMessage({ type: "error", text: "Please fill in all fields." });
    }
    if (!isNumeric) {
      return setMessage({ type: "error", text: "ID Number must contain only numbers." });
    }
    if (idNumber.length < 8 || idNumber.length > 20) {
      return setMessage({ type: "error", text: "Invalid ID Number length." });
    }
    if (password.length < 8) {
      return setMessage({ type: "error", text: "Password is too short." });
    }

    try {
      setIsLoggingIn(true);
      setMessage({ type: "success", text: "Logging you in..." });

      const result = await loginUser(idNumber, password);
      const roleId = (result as any).role_id;

      if (result.success) {
        // Store the logged-in user once — every screen reads from context now.
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
      setIsLoggingIn(false);
    }
  }

  // Sign up step 1: validate → send OTP through the real backend (Brevo email
  // via /auth/send-signup-otp/) → open the OTP modal.
  async function handleSignup() {
    const { idNumber, email, password, confirmPassword } = signupForm;
    const emailRegex = /\S+@\S+\.\S+/;
    const isNumeric = /^\d+$/.test(idNumber);

    if (!idNumber || !email || !password || !confirmPassword) {
      return setMessage({ type: "error", text: "Please fill in all fields." });
    }
    if (!isNumeric) {
      return setMessage({ type: "error", text: "ID Number must contain only numbers." });
    }
    if (idNumber.length < 8 || idNumber.length > 20) {
      return setMessage({ type: "error", text: "Invalid ID Number length." });
    }
    if (!emailRegex.test(email)) {
      return setMessage({ type: "error", text: "Invalid email format." });
    }
    if (password.length < 8) {
      return setMessage({ type: "error", text: "Password must be at least 8 characters." });
    }
    if (password !== confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match." });
    }
    if (!termsAccepted) {
      return setMessage({ type: "error", text: "Please accept the Terms & Conditions." });
    }

    try {
      setIsSigningUp(true);
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
      setIsSigningUp(false);
    }
  }

  // Sign up step 2: verify the OTP against /auth/verify-signup-otp/, which is
  // what actually creates the Django auth_user + Users profile row.
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

  // Small helper so border-highlighting stays purely presentational
  const fieldStyle = (key: string) => [
    s.inputRow,
    focusedField === key && s.inputRowFocused,
  ];

  // ── Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]} edges={["left", "right", "bottom"]}>

      {/* ── Decorative navy header (signature element) ── */}
      <View style={s.headerCurve} pointerEvents="none">
        <View style={s.ringOuter} />
        <View style={s.ringMid} />
        <View style={s.diamond} />
        <View style={s.dotGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={s.dot} />
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >

          {/* ── Brand mark ── */}
          <View style={s.brandWrap}>
            <View style={s.logoRing}>
              <View style={s.logoCircle}>
                <Text style={s.logoText}>CITC</Text>
              </View>
            </View>
            <Text style={s.brandTitle}>Academic Procedure Portal</Text>
            <Text style={s.brandSub}>College of Information Technology and Computing</Text>
          </View>

          <View style={s.card}>

            {/* ── Toggle pill (Login / Sign Up) ── */}
            <View style={s.toggleWrap}>
              <View style={[s.pill, tab === "signup" && s.pillRight]} />

              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => switchTab("login")}
                activeOpacity={0.85}
              >
                <Text style={[s.toggleText, tab === "login" && s.toggleActive]}>
                  Login
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => switchTab("signup")}
                activeOpacity={0.85}
              >
                <Text style={[s.toggleText, tab === "signup" && s.toggleActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Login Form ── */}
            {tab === "login" && (
              <View>

                <View style={s.field}>
                  <Text style={s.label}>ID Number</Text>
                  <View style={fieldStyle("loginId")}>
                    <MaterialIcons name="badge" size={18} color={MUTED} style={s.inputIcon} />
                    <TextInput
                      style={[s.input, noWebOutline]}
                      placeholder="Enter ID Number"
                      placeholderTextColor="#B7B0D6"
                      value={loginForm.idNumber}
                      onChangeText={(v) => setLoginForm({ ...loginForm, idNumber: v })}
                      onFocus={() => setFocusedField("loginId")}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="numeric"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={s.field}>
                  <Text style={s.label}>Password</Text>
                  <View style={fieldStyle("loginPassword")}>
                    <MaterialIcons name="lock-outline" size={18} color={MUTED} style={s.inputIcon} />
                    <TextInput
                      style={[s.input, noWebOutline]}
                      placeholder="Enter Password"
                      placeholderTextColor="#B7B0D6"
                      value={loginForm.password}
                      onChangeText={(v) => setLoginForm({ ...loginForm, password: v })}
                      onFocus={() => setFocusedField("loginPassword")}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showLoginPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowLoginPassword(!showLoginPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons
                        name={showLoginPassword ? "visibility-off" : "visibility"}
                        size={18}
                        color={MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setShowForgot(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.forgot}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.btn, isLoggingIn && s.btnDisabled]}
                  onPress={handleLogin}
                  activeOpacity={0.88}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.btnText}>Log In</Text>
                  )}
                </TouchableOpacity>

              </View>
            )}

            {/* ── Sign Up Form ── */}
            {tab === "signup" && (
              <View>

                <View style={s.field}>
                  <Text style={s.label}>ID Number</Text>
                  <View style={fieldStyle("signupId")}>
                    <MaterialIcons name="badge" size={18} color={MUTED} style={s.inputIcon} />
                    <TextInput
                      style={[s.input, noWebOutline]}
                      placeholder="Enter ID Number"
                      placeholderTextColor="#B7B0D6"
                      value={signupForm.idNumber}
                      onChangeText={(v) => setSignupForm({ ...signupForm, idNumber: v })}
                      onFocus={() => setFocusedField("signupId")}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={s.field}>
                  <Text style={s.label}>Email</Text>
                  <View style={fieldStyle("signupEmail")}>
                    <MaterialIcons name="mail-outline" size={18} color={MUTED} style={s.inputIcon} />
                    <TextInput
                      style={[s.input, noWebOutline]}
                      placeholder="Enter Email Address"
                      placeholderTextColor="#B7B0D6"
                      value={signupForm.email}
                      onChangeText={(v) => setSignupForm({ ...signupForm, email: v })}
                      onFocus={() => setFocusedField("signupEmail")}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={s.field}>
                  <Text style={s.label}>Password</Text>
                  <View style={fieldStyle("signupPassword")}>
                    <MaterialIcons name="lock-outline" size={18} color={MUTED} style={s.inputIcon} />
                    <TextInput
                      style={[s.input, noWebOutline]}
                      placeholder="Create a Password"
                      placeholderTextColor="#B7B0D6"
                      value={signupForm.password}
                      onChangeText={(v) => setSignupForm({ ...signupForm, password: v })}
                      onFocus={() => setFocusedField("signupPassword")}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showSignupPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowSignupPassword(!showSignupPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons
                        name={showSignupPassword ? "visibility-off" : "visibility"}
                        size={18}
                        color={MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.field}>
                  <Text style={s.label}>Confirm Password</Text>
                  <View style={fieldStyle("signupConfirmPassword")}>
                    <MaterialIcons name="lock-outline" size={18} color={MUTED} style={s.inputIcon} />
                    <TextInput
                      style={[s.input, noWebOutline]}
                      placeholder="Re-enter Password"
                      placeholderTextColor="#B7B0D6"
                      value={signupForm.confirmPassword}
                      onChangeText={(v) => setSignupForm({ ...signupForm, confirmPassword: v })}
                      onFocus={() => setFocusedField("signupConfirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialIcons
                        name={showConfirmPassword ? "visibility-off" : "visibility"}
                        size={18}
                        color={MUTED}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ── Terms & Conditions checkbox ── */}
                <TouchableOpacity
                  style={s.checkRow}
                  onPress={() => setTermsAccepted((p) => !p)}
                  activeOpacity={0.7}
                >
                  <View style={[s.checkbox, termsAccepted && s.checkboxActive]}>
                    {termsAccepted && (
                      <MaterialIcons name="check" size={13} color="#fff" />
                    )}
                  </View>
                  <Text style={s.checkLabel}>
                    I have read and accepted the{" "}
                    <Text style={s.checkLink} onPress={() => setShowTerms(true)}>
                      Terms &amp; Conditions
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.btn, (isSigningUp || !termsAccepted) && s.btnDisabled]}
                  onPress={handleSignup}
                  activeOpacity={0.88}
                  disabled={isSigningUp || !termsAccepted}
                >
                  {isSigningUp ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.btnText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                <Text style={s.terms}>
                  By signing up you agree to our Terms of Service.
                </Text>

              </View>
            )}

            {/* ── Feedback Message ── */}
            {message && (
              <View style={[s.msg, message.type === "error" ? s.msgErr : s.msgOk]}>
                <MaterialIcons
                  name={message.type === "error" ? "error-outline" : "check-circle"}
                  size={16}
                  color={message.type === "error" ? "#B91C1C" : "#15803D"}
                  style={{ marginRight: 6 }}
                />
                <Text style={message.type === "error" ? s.msgErrText : s.msgOkText}>
                  {message.text}
                </Text>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Terms & Forgot Password modals ──────────────────────────
          These are the same components used elsewhere in the app and
          are already wired to the Django backend — nothing to change
          on the server side. ── */}
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      <ForgotPasswordModal visible={showForgot} onClose={() => setShowForgot(false)} />

      {/* ── Signup OTP modal ── */}
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
          <Pressable style={s.otpOverlay} onPress={() => setShowOtpModal(false)}>
            <Pressable style={s.otpCard} onPress={() => {}}>

              <TouchableOpacity style={s.otpCloseBtn} onPress={() => setShowOtpModal(false)}>
                <MaterialIcons name="chevron-left" size={20} color={NAVY_DEEP} />
                <Text style={s.otpCloseText}>Verify Email</Text>
              </TouchableOpacity>

              <View style={s.otpIconCircle}>
                <MaterialIcons name="dialpad" size={40} color={NAVY_DEEP} />
              </View>

              <Text style={s.otpTitle}>Check Your Email</Text>
              <Text style={s.otpSub}>
                A 6-digit OTP was sent to{"\n"}
                <Text style={s.otpEmail}>{signupForm.email}</Text>
              </Text>

              <View style={s.otpInputWrap}>
                <MaterialIcons name="lock-outline" size={18} color={NAVY_DEEP} style={s.inputIcon} />
                <TextInput
                  style={[s.otpInput, noWebOutline]}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor={MUTED}
                  value={otp}
                  onChangeText={(v) => { setOtp(v); setOtpError(""); }}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              {otpError ? <Text style={s.otpErrorText}>{otpError}</Text> : null}

              {/* Compact, content-sized button instead of stretching the
                  full width of the card — this is the button style used
                  ONLY here, separate from the full-width form buttons. */}
              <TouchableOpacity
                style={[s.otpVerifyBtn, (otp.length < 6 || otpLoading) && s.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={otp.length < 6 || otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.btnText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={s.otpResendWrap}
                onPress={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setOtpError("");
                }}
              >
                <Text style={s.otpResend}>Change Email</Text>
              </TouchableOpacity>

            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: { flex: 1 },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 36,
    paddingBottom: 48,
  },

  // ── Decorative header ──────────────────────────────────────────────────
  headerCurve: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: NAVY_DEEP,
    borderBottomLeftRadius: 52,
    borderBottomRightRadius: 52,
    overflow: "hidden",
  },
  ringOuter: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: "rgba(235,169,55,0.22)",
    top: -80,
    right: -70,
  },
  ringMid: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(235,169,55,0.10)",
    bottom: -40,
    left: -40,
  },
  diamond: {
    position: "absolute",
    width: 46,
    height: 46,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    top: 46,
    left: 32,
    transform: [{ rotate: "45deg" }],
  },
  dotGrid: {
    position: "absolute",
    top: 34,
    right: 40,
    width: 44,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  // ── Brand mark ─────────────────────────────────────────────────────────
  brandWrap: { alignItems: "center", marginBottom: 22 },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(235,169,55,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoText: {
    color: NAVY_DEEP,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1,
  },
  brandTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },
  brandSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 260,
  },

  // White card that wraps the whole form
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 26,
    width: "100%",
    maxWidth: 400,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },

  // Background container for the toggle pill
  toggleWrap: {
    backgroundColor: "#EFECF8",
    borderRadius: 100,
    padding: 4,
    flexDirection: "row",
    position: "relative",
    marginBottom: 26,
  },

  // Navy sliding pill — sits behind the active tab label
  pill: {
    position: "absolute",
    top: 4,
    left: 4,
    width: "50%",
    height: "98%",
    backgroundColor: NAVY,
    borderRadius: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  pillRight: { left: "51%" },

  toggleBtn:    { flex: 1, paddingVertical: 10, alignItems: "center", zIndex: 1 },
  toggleText:   { fontSize: 14, fontWeight: "600", color: "#7A749A" },
  toggleActive: { color: "#fff", fontWeight: "700" },

  field: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: NAVY,
  },

  // Field row: icon + text input (+ optional trailing action) inside a bordered pill
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: FIELD_BD,
    borderRadius: 12,
    backgroundColor: FIELD_BG,
    paddingHorizontal: 12,
  },
  inputRowFocused: {
    borderColor: GOLD,
    backgroundColor: "#fff",
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#3A2E63",
    paddingVertical: 12,
  },

  forgot: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 16,
    marginTop: -4,
    color: GOLD,
  },

  btn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    minHeight: 50,
    backgroundColor: NAVY,
    elevation: 3,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  terms: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 17,
    color: MUTED,
  },

  // ── Terms checkbox row (signup) ─────────────────────────────────────────
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
    borderColor: FIELD_BD,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  checkLabel: {
    flex: 1,
    fontSize: 12,
    color: "#5D5A78",
    lineHeight: 18,
  },
  checkLink: {
    fontWeight: "700",
    color: NAVY,
    textDecorationLine: "underline",
  },

  msg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  msgErr:     { backgroundColor: "#FEF2F2" },
  msgOk:      { backgroundColor: "#F0FDF4" },
  msgErrText: { color: "#B91C1C", fontSize: 13, fontWeight: "500" },
  msgOkText:  { color: "#15803D", fontSize: 13, fontWeight: "500" },

  // ── Signup OTP modal ─────────────────────────────────────────────────────
  otpOverlay: {
    flex: 1,
    backgroundColor: "rgba(13,19,84,0.55)",
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
    maxWidth: 400,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  otpCloseBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    gap: 4,
  },
  otpCloseText: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY_DEEP,
  },
  otpIconCircle: {
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
    color: NAVY_DEEP,
    marginBottom: 10,
  },
  otpSub: {
    fontSize: 13,
    color: NAVY_DEEP,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  otpEmail: {
    fontWeight: "700",
    color: NAVY_DEEP,
  },
  otpInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1.5,
    borderColor: FIELD_BD,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    backgroundColor: FIELD_BG,
  },
  otpInput: {
    flex: 1,
    fontSize: 14,
    color: "#3A2E63",
    paddingVertical: 0,
  },
  otpErrorText: {
    color: "#B91C1C",
    fontSize: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  // Compact "Verify OTP" button: sized to its content instead of stretching
  // to the full card width like the main form's Log In / Create Account CTAs.
  // No minWidth here on purpose — it should hug the label, same as the
  // "Change Email" link below it, not pad out to an arbitrary floor.
  otpVerifyBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 26,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
    minHeight: 42,
    backgroundColor: NAVY,
    elevation: 3,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  otpResendWrap: {
    marginTop: 14,
    paddingVertical: 4,
  },
  otpResend: {
    color: GOLD,
    fontSize: 14,
    fontWeight: "600",
  },

});