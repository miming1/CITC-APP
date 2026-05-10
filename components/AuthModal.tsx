import { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";

type AuthModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;

  // Pass the actual user password OR verification function
  verifyPassword: (password: string) => Promise<boolean>;
};

export default function AuthModal({
  visible,
  onClose,
  onSuccess,
  verifyPassword,
}: AuthModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleVerify = async () => {
    if (!password.trim()) {
      Alert.alert("Missing Password", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // REAL AUTHENTICATION
      const isValid = await verifyPassword(password);

      if (isValid) {
        setPassword("");
        onSuccess();
        onClose();
      } else {
        Alert.alert("Authentication Failed", "Incorrect password.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
            styles.modalContainer,
            {
              backgroundColor: theme.background,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
                fontFamily: Fonts.rounded,
              },
            ]}
          >
            Admin Authentication
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.icon,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            Please confirm your password to continue.
          </Text>

          <TextInput
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor={theme.icon}
            value={password}
            onChangeText={setPassword}
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "#F8F8F8",
              },
            ]}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: theme.border,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor: theme.tint,
                },
              ]}
              onPress={handleVerify}
              disabled={loading}
            >
              <Text style={styles.confirmText}>
                {loading ? "Verifying..." : "Confirm"}
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

  modalContainer: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },

  title: {
    fontSize: 22,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },

  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },

  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },

  confirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
});