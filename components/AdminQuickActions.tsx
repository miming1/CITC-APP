import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  onScanQR: () => void;
  onManualEntry: () => void;
}

export default function AdminQuickActions({
  onScanQR,
  onManualEntry,
}: Props) {
  return (
    <View style={styles.container}>
      
      <TouchableOpacity style={styles.button} onPress={onScanQR}>
        <Text style={styles.title}>Scan QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onManualEntry}>
        <Text style={styles.title}>Manual Entry</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },

  button: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#EEE7FF",
    alignItems: "center",
  },

  title: {
    fontWeight: "700",
    color: "#422780",
  },
});