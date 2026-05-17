import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

type Step = "email" | "sent";

export default function ForgotPasswordModal({ visible, onClose }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /\S+@\S+\.\S+/;

  const handleSend = async () => {
    setError("");
    if (!email.trim()) return setError("Please enter your email address.");
    if (!emailRegex.test(email)) return setError("Please enter a valid email address.");
    setLoading(true);
    // TODO: wire up to backend reset endpoint e.g. POST /api/auth/forgot-password/
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep("sent");
  };

  const handleClose = () => {
    setEmail("");
    setStep("email");
    setError("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={s.overlay} onPress={handleClose}>
        <Pressable style={s.card} onPress={() => {}}>

          {/* Close */}
          <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
            <Ionicons name="chevron-back" size={20} color="#9B7FD4" />
            <Text style={s.closeText}>Forgot Password</Text>
          </TouchableOpacity>

          {step === "email" ? (
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
                Please enter your registered email ID.{"\n"}
                We will send a verification link to your registered email.
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
                onPress={handleSend}
                disabled={!email.trim() || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnText}>Next</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={s.iconWrap}>
                <View style={[s.iconCircle, s.sentCircle]}>
                  <Ionicons name="checkmark-circle-outline" size={40} color="#5D429D" />
                </View>
              </View>

              <Text style={s.sentTitle}>Email Sent!</Text>
              <Text style={s.sub}>
                If <Text style={s.emailBold}>{email}</Text> is registered, a password reset
                link has been sent. Check your inbox or spam folder.
              </Text>

              <TouchableOpacity style={s.btn} onPress={handleClose}>
                <Text style={s.btnText}>Done</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={handleClose} style={s.cancelWrap}>
            <Text style={s.cancel}>Cancel</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
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
  closeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#422780",
  },
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
  sentCircle: {
    backgroundColor: "#EFF7EE",
  },
  sparkle: {
    position: "absolute",
    top: 0,
    right: -8,
  },
  sub: {
    fontSize: 13,
    color: "#6B5A8E",
    lineHeight: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  sentTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#422780",
    marginBottom: 10,
  },
  emailBold: {
    fontWeight: "700",
    color: "#422780",
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
    color: "#4b2170",
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
  cancelWrap: {
    marginTop: 14,
    paddingVertical: 4,
  },
  cancel: {
    color: "#9B7FD4",
    fontSize: 14,
    fontWeight: "600",
  },
});