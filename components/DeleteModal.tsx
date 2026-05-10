import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";

type DeleteModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteModal({
  visible,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
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
            Delete Item
          </Text>

          <Text
            style={[
              styles.message,
              {
                color: theme.icon,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            Are you sure you want to delete this item? This action cannot be undone.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: theme.border,
                },
              ]}
              onPress={onCancel}
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
              style={styles.deleteButton}
              onPress={onConfirm}
            >
              <Text style={styles.deleteText}>
                Delete
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
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
  },

  title: {
    fontSize: 22,
    marginBottom: 10,
  },

  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  deleteButton: {
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },

  deleteText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});