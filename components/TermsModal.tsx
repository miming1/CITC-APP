import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_H } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.overlay} onPress={onClose}>
        {/* Inner Pressable stops tap-through closing when tapping content */}
        <Pressable style={s.card} onPress={() => {}}>
          <Text style={s.title}>Terms &amp; Conditions</Text>

          <ScrollView
            style={s.scrollArea}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >
            <Text style={s.section}>1. Acceptance of Terms</Text>
            <Text style={s.body}>
              By creating an account and using the CITC Academic Procedure Portal (CITC-APP),
              you agree to be bound by these Terms and Conditions. If you do not agree, please
              do not use the App.
            </Text>

            <Text style={s.section}>2. Use of the App</Text>
            <Text style={s.body}>
              The App is intended solely for students, faculty, and staff of USTP-CDO's
              College of Information Technology and Computing (CITC). You agree to use the
              App only for its intended purpose: tracking and managing academic procedures
              and document submissions.
            </Text>

            <Text style={s.section}>3. Account Responsibility</Text>
            <Text style={s.body}>
              You are responsible for maintaining the confidentiality of your account
              credentials. Notify the CITC administration immediately of any unauthorized
              use. The college is not liable for any loss resulting from unauthorized access.
            </Text>

            <Text style={s.section}>4. Privacy &amp; Data</Text>
            <Text style={s.body}>
              Your personal information (student ID, email address) is collected solely for
              authentication and communication purposes. We do not share your data with
              third parties outside of USTP-CDO's internal systems.
            </Text>

            <Text style={s.section}>5. Document Submissions</Text>
            <Text style={s.body}>
              You are responsible for the accuracy of all documents and information you
              submit. Submission of false or misleading documents may result in disciplinary
              action in accordance with USTP-CDO's student handbook.
            </Text>

            <Text style={s.section}>6. Modifications</Text>
            <Text style={s.body}>
              CITC reserves the right to modify these Terms at any time. Continued use of
              the App after changes constitutes acceptance of the revised Terms.
            </Text>

            <Text style={s.section}>7. Contact</Text>
            <Text style={s.body}>
              For questions about these Terms, please contact the CITC administration office
              at USTP-CDO.
            </Text>

            <View style={{ height: 8 }} />
          </ScrollView>

          <TouchableOpacity style={s.btn} onPress={onClose}>
            <Text style={s.btnText}>I Understand</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(13,19,84,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  // This used to be a full-width, edge-to-edge bottom sheet (`width: "100%"`,
  // `justifyContent: "flex-end"` on the overlay). On desktop/web that made it
  // eat the whole viewport. Now it's a centered, capped-width card like the
  // other auth modals (Forgot Password / Verify OTP).
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 520,
    maxHeight: Platform.OS === "web" ? "85vh" as any : SCREEN_H * 0.8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#422780",
    marginBottom: 16,
    textAlign: "center",
  },
  scrollArea: {
    maxHeight: SCREEN_H * 0.5,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    fontSize: 14,
    fontWeight: "700",
    color: "#422780",
    marginTop: 12,
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },
  btn: {
    backgroundColor: "#D3C1FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    alignSelf: "center",
    minWidth: 180,
    marginTop: 16,
  },
  btnText: {
    color: "#422780",
    fontWeight: "700",
    fontSize: 15,
  },
});