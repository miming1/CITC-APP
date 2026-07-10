import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QRCodeModal({
  visible,
  onClose,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const handleContinue = () => {
    onClose();

    router.push("/QRScanResult");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(235,169,55,0.18)"
                    : "#FFF6E5",
              },
            ]}
          >
            <MaterialIcons
              name="qr-code-scanner"
              size={38}
              color={colors.tint2}
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: Fonts.rounded,
              },
            ]}
          >
            Scan QR Code
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors.icon,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            We'll ask for camera permission so you can scan the document QR code.
          </Text>

          <View style={styles.infoBox}>
            <MaterialIcons
              name="camera-alt"
              size={20}
              color={colors.tint}
            />

            <Text
              style={[
                styles.infoText,
                {
                  color: colors.icon,
                },
              ]}
            >
              Camera access is only used while scanning a QR code.
            </Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: colors.border,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.continueButton,
                {
                  backgroundColor: colors.tint,
                },
              ]}
              onPress={handleContinue}
            >
              <MaterialIcons
                name="camera-alt"
                size={18}
                color="#fff"
              />

              <Text style={styles.continueText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modal: {
    width: "50%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 23,
    textAlign: "center",
    marginBottom: 10,
  },

  description: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(30,64,175,0.08)",
    marginBottom: 24,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  buttons: {
    flexDirection: "row",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  continueButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  cancelText: {
    fontWeight: "700",
    fontSize: 15,
  },

  continueText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});