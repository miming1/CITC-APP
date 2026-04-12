import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View, Alert, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DocList from "../components/DocList";
import Dropdown from "../components/Dropdown";
import { Colors } from "../constants/theme";
import Camera from "@/components/Camera";
import { Camera as ExpoCamera } from "expo-camera";

export default function ScanScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [ID, setID] = useState("");
  const [name, setName] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [program, setProgram] = useState("");

  const [cameraVisible, setCameraVisible] = useState(false);


  const requestCameraPermission = async () => {
    const { status } =
      await ExpoCamera.requestCameraPermissionsAsync();

    if (status === "granted") {
      setCameraVisible(true);
    } else {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to proceed."
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Choose Document to Scan
        </Text>

        <Text style={[styles.description, { color: colors.icon }]}>
          Select the type of document you need to scan and provide your student information.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Document Type
        </Text>

        <DocList icon="description" text="Medical Certificate" />
        <DocList icon="mail" text="Letter of Excuse" />
        <DocList icon="badge" text="Student ID" />

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Student Information</Text>

          <Text style={styles.inputLabel}>Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your student ID"
            keyboardType="numeric"
            value={ID}
            onChangeText={setID}
          />

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          <Dropdown
            label="Year Level"
            buttonText="Select year level"
            data={[
              { label: "1st Year", value: "1" },
              { label: "2nd Year", value: "2" },
              { label: "3rd Year", value: "3" },
              { label: "4th Year", value: "4" },
            ]}
            value={yearLevel}
            onSelect={setYearLevel}
          />

          <Dropdown
            label="Program"
            buttonText="Select program"
            data={[
              { label: "BS Information Technology", value: "BSIT" },
              { label: "BS Computer Science", value: "BSCS" },
              { label: "BS Technology Communication Management", value: "BS-TCM" },
            ]}
            value={program}
            onSelect={setProgram}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.ProceedBtn, { backgroundColor: "#9B7FD4" }]}
          onPress={requestCameraPermission}
        >
          <Text style={styles.ProceedBtnText}>
            {"Proceed"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera */}
      <Camera
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={async (uri: string) => {
          setCameraVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    padding: 16,
    paddingBottom: 160,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  description: {
    marginBottom: 10,
    color: "#555",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 10,
  },

  detailsContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },

  detailsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },

  ProceedBtn: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },

  ProceedBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});