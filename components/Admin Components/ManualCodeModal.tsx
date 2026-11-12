import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export default function ManualCodeModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [code, setCode] = useState("");

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { width } = useWindowDimensions();

  const handleSubmit = () => {
    if (!code.trim()) return;

    onSubmit(code.trim());
    setCode("");
    onClose();
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
            styles.container,
            {
              width: width > 900 ? "50%" : "92%",
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {/* ICON */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "#172554"
                    : "#DBEAFE",
              },
            ]}
          >
            <MaterialIcons
              name="pin"
              size={34}
              color={colors.tint}
            />
          </View>

          {/* TITLE */}
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: Fonts.rounded,
              },
            ]}
          >
            Enter Tracking Code
          </Text>

          {/* DESCRIPTION */}
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.icon,
              },
            ]}
          >
            Enter the tracking reference to view its latest status.
          </Text>


          {/* INPUT */}
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "#F8FAFC",
              },
            ]}
          />

          <Text
            style={[
              styles.helper,
              {
                color: colors.icon,
              },
            ]}
          >
            The tracking code is shown below the generated QR code.
          </Text>

          {/* BUTTONS */}
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
              disabled={!code.trim()}
              style={[
                styles.submitButton,
                {
                  backgroundColor: code.trim()
                    ? colors.tint
                    : colors.border,
                },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>
                Track Document
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

  container: {
    width: "50%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
  },

  iconContainer: {
    width: 74,
    height: 74,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    letterSpacing: 1,
  },

  helper: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 28,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  submitButton: {
    minWidth: 145,
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },

  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});