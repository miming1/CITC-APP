import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../constants/theme";
import { loginUser, registerUser } from "../lib/auth";

export default function LoginScreen() {

  // =========================================================
  // THEME
  // =========================================================

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];

  const TINT = Colors.light.tint;

  // =========================================================
  // STATE
  // =========================================================

  const [tab, setTab] = useState<"login" | "signup">("login");

  const [loginForm, setLoginForm] = useState({
    idNumber: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    idNumber: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // TAB SWITCH
  // =========================================================

  function switchTab(t: "login" | "signup") {
    setTab(t);
    setMessage(null);
  }

  // =========================================================
  // LOGIN
  // =========================================================

  async function handleLogin() {

    const { idNumber, password } = loginForm;

    const isNumeric = /^\d+$/.test(idNumber);

    // ---------- VALIDATIONS ----------

    if (!idNumber.trim() || !password.trim()) {
      setMessage({
        type: "error",
        text: "Please fill in all fields.",
      });
      return;
    }

    if (!isNumeric) {
      setMessage({
        type: "error",
        text: "ID Number must contain only numbers.",
      });
      return;
    }

    if (idNumber.length < 8 || idNumber.length > 20) {
      setMessage({
        type: "error",
        text: "Invalid ID Number length.",
      });
      return;
    }

    if (password.length < 8 || password.length > 50) {
      setMessage({
        type: "error",
        text: "Password is too short.",
      });
      return;
    }

    // ---------- API ----------

    try {

      setLoading(true);

      setMessage({
        type: "success",
        text: "Logging you in...",
      });

      const result = await loginUser(idNumber, password);

      // =====================================================
      // SUCCESS
      // =====================================================

      if (result.success) {

        const roleId = result.role_id;

        setMessage({
          type: "success",
          text: "Login successful!",
        });

        setTimeout(() => {

          setMessage(null);

          // ===============================================
          // ROLE-BASED ROUTING
          // ===============================================

          // ROLE 2 = CUSTOM ADMIN
          if (roleId === 2) {

            router.replace({
              pathname: "/AdminDashboard",
              params: {
                idNumber: idNumber,
              },
            });

          }

          // ROLE 1 = STUDENT / NORMAL USER
          else {

            router.replace({
              pathname: "/Userdashboard",
              params: {
                idNumber: idNumber,
              },
            });

          }

        }, 700);

      }

      // =====================================================
      // FAILED LOGIN
      // =====================================================

      else {

        setMessage({
          type: "error",
          text: result.error || "Invalid ID or password.",
        });

      }

    }

    catch (error) {

      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });

    }

    finally {

      setLoading(false);

    }

  }

  // =========================================================
  // SIGN UP
  // =========================================================

  async function handleSignup() {

    const { idNumber, email, password } = signupForm;

    const emailRegex = /\S+@\S+\.\S+/;
    const isNumeric = /^\d+$/.test(idNumber);

    // ---------- VALIDATIONS ----------

    if (!idNumber || !email || !password) {

      setMessage({
        type: "error",
        text: "Please fill in all fields.",
      });

      return;
    }

    if (!isNumeric) {

      setMessage({
        type: "error",
        text: "ID Number must contain only numbers.",
      });

      return;
    }

    if (idNumber.length < 8 || idNumber.length > 20) {

      setMessage({
        type: "error",
        text: "Invalid ID Number length.",
      });

      return;
    }

    if (!emailRegex.test(email)) {

      setMessage({
        type: "error",
        text: "Invalid email format.",
      });

      return;
    }

    if (password.length < 8 || password.length > 50) {

      setMessage({
        type: "error",
        text: "Password is too short.",
      });

      return;
    }

    // ---------- API ----------

    try {

      setLoading(true);

      const result = await registerUser(
        idNumber,
        email,
        password
      );

      if (result.success) {

        setMessage({
          type: "success",
          text: "Account created successfully!",
        });

        setTimeout(() => {

          setTab("login");

          setMessage(null);

        }, 1000);

      }

      else {

        setMessage({
          type: "error",
          text: result.error || "Registration failed.",
        });

      }

    }

    catch (error) {

      setMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });

    }

    finally {

      setLoading(false);

    }

  }

  // =========================================================
  // RENDER
  // =========================================================

  return (

    <SafeAreaView
      style={[
        s.safe,
        { backgroundColor: colors.background }
      ]}
    >

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >

          <View style={s.card}>

            {/* ================================================= */}
            {/* LOGO */}
            {/* ================================================= */}

            <View style={s.logoWrap}>

              <View
                style={[
                  s.logoCircle,
                  { backgroundColor: TINT }
                ]}
              >

                <Text style={s.logoText}>
                  CITC
                </Text>

              </View>

            </View>

            {/* ================================================= */}
            {/* LOGIN / SIGNUP TOGGLE */}
            {/* ================================================= */}

            <View style={s.toggleWrap}>

              <View
                style={[
                  s.pill,
                  tab === "signup" && s.pillRight
                ]}
              />

              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => switchTab("login")}
                activeOpacity={0.8}
              >

                <Text
                  style={[
                    s.toggleText,
                    { color: "#422780" },
                    tab === "login" && s.toggleActive,
                  ]}
                >
                  Login
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => switchTab("signup")}
                activeOpacity={0.8}
              >

                <Text
                  style={[
                    s.toggleText,
                    { color: "#422780" },
                    tab === "signup" && s.toggleActive,
                  ]}
                >
                  Sign Up
                </Text>

              </TouchableOpacity>

            </View>

            {/* ================================================= */}
            {/* LOGIN FORM */}
            {/* ================================================= */}

            {tab === "login" && (

              <View>

                <View style={s.field}>

                  <Text
                    style={[
                      s.label,
                      { color: "#422780" }
                    ]}
                  >
                    ID Number
                  </Text>

                  <TextInput
                    style={[
                      s.input,
                      { color: "#4b2170" }
                    ]}
                    placeholder="Enter ID Number"
                    placeholderTextColor={"#CCBACE"}
                    value={loginForm.idNumber}
                    onChangeText={(v) =>
                      setLoginForm({
                        ...loginForm,
                        idNumber: v,
                      })
                    }
                    keyboardType="numeric"
                  />

                </View>

                <View style={s.field}>

                  <Text
                    style={[
                      s.label,
                      { color: "#422780" }
                    ]}
                  >
                    Password
                  </Text>

                  <TextInput
                    style={[
                      s.input,
                      { color: "#4b2170" }
                    ]}
                    placeholder="Enter Password"
                    placeholderTextColor={"#CCBACE"}
                    value={loginForm.password}
                    onChangeText={(v) =>
                      setLoginForm({
                        ...loginForm,
                        password: v,
                      })
                    }
                    secureTextEntry
                  />

                </View>

                <Text
                  style={[
                    s.forgot,
                    { color: "#5D429D" }
                  ]}
                >
                  Forgot password?
                </Text>

                <TouchableOpacity
                  style={[
                    s.btn,
                    { backgroundColor: TINT }
                  ]}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                  disabled={loading}
                >

                  {loading ? (

                    <ActivityIndicator color="#fff" />

                  ) : (

                    <Text style={s.btnText}>
                      Log In
                    </Text>

                  )}

                </TouchableOpacity>

              </View>

            )}

            {/* ================================================= */}
            {/* SIGNUP FORM */}
            {/* ================================================= */}

            {tab === "signup" && (

              <View>

                <View style={s.field}>

                  <Text
                    style={[
                      s.label,
                      { color: "#422780" }
                    ]}
                  >
                    ID Number
                  </Text>

                  <TextInput
                    style={[
                      s.input,
                      { color: "#4b2170" }
                    ]}
                    placeholder="Enter ID Number"
                    placeholderTextColor={"#CCBACE"}
                    value={signupForm.idNumber}
                    onChangeText={(v) =>
                      setSignupForm({
                        ...signupForm,
                        idNumber: v,
                      })
                    }
                    keyboardType="numeric"
                  />

                </View>

                <View style={s.field}>

                  <Text
                    style={[
                      s.label,
                      { color: "#422780" }
                    ]}
                  >
                    Email
                  </Text>

                  <TextInput
                    style={[
                      s.input,
                      { color: "#4b2170" }
                    ]}
                    placeholder="Enter Email Address"
                    placeholderTextColor={"#CCBACE"}
                    value={signupForm.email}
                    onChangeText={(v) =>
                      setSignupForm({
                        ...signupForm,
                        email: v,
                      })
                    }
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                </View>

                <View style={s.field}>

                  <Text
                    style={[
                      s.label,
                      { color: "#422780" }
                    ]}
                  >
                    Password
                  </Text>

                  <TextInput
                    style={[
                      s.input,
                      { color: "#4b2170" }
                    ]}
                    placeholder="Create a Password"
                    placeholderTextColor={"#CCBACE"}
                    value={signupForm.password}
                    onChangeText={(v) =>
                      setSignupForm({
                        ...signupForm,
                        password: v,
                      })
                    }
                    secureTextEntry
                  />

                </View>

                <TouchableOpacity
                  style={[
                    s.btn,
                    { backgroundColor: TINT }
                  ]}
                  onPress={handleSignup}
                  activeOpacity={0.85}
                  disabled={loading}
                >

                  {loading ? (

                    <ActivityIndicator color="#fff" />

                  ) : (

                    <Text style={s.btnText}>
                      Create Account
                    </Text>

                  )}

                </TouchableOpacity>

                <Text
                  style={[
                    s.terms,
                    { color: colors.icon }
                  ]}
                >
                  By signing up you agree to our Terms of Service.
                </Text>

              </View>

            )}

            {/* ================================================= */}
            {/* MESSAGE */}
            {/* ================================================= */}

            {message && (

              <View
                style={[
                  s.msg,
                  message.type === "error"
                    ? s.msgErr
                    : s.msgOk,
                ]}
              >

                <Text
                  style={
                    message.type === "error"
                      ? s.msgErrText
                      : s.msgOkText
                  }
                >
                  {message.text}
                </Text>

              </View>

            )}

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );

}

// =============================================================
// STYLES
// =============================================================

const s = StyleSheet.create({

  safe: {
    flex: 1,
  },

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
    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 16,
  },

  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },

  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,

    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#fff",
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "600",
  },

  toggleWrap: {
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
    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  pillRight: {
    left: "51%",
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    zIndex: 1,
  },

  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },

  toggleActive: {
    fontWeight: "700",
  },

  field: {
    marginBottom: 14,
  },

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

  forgot: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 14,
    marginTop: -4,
  },

  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    minHeight: 50,
  },

  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  terms: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 17,
  },

  msg: {
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
    alignItems: "center",
  },

  msgErr: {
    backgroundColor: "#fef2f2",
  },

  msgOk: {
    backgroundColor: "#f0fdf4",
  },

  msgErrText: {
    color: "#b91c1c",
    fontSize: 13,
  },

  msgOkText: {
    color: "#15803d",
    fontSize: 13,
  },

});