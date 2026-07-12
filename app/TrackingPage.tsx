import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, useWindowDimensions, View, } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Universal Components/Header";
import InfoCard from "@/components/User Components/InfoCard";
import DocList from "../components/User Components/DocumentChoices";

import { API_BASE_URL, ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getStoredToken } from "../lib/tokenStore";

interface StudentInfo {
  studentId: string;
  email: string;
  name: string;
  program: string;
  yearLevel: string;
}

interface Document {
  document_id: number;
  document_name: string;
}

export default function TrackScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const procedureId = Number(id);

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // =========================
  // RESPONSIVE LAYOUT
  // =========================

  const { width } = useWindowDimensions();
  const horizontalMargin = width > 768 ? 100 : 20;

  const isDesktop = width >= 768;

  const [documents, setDocuments] = useState<Document[]>([]);

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<number | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [errors, setErrors] = useState<string[]>([]);

  const [studentInfo, setStudentInfo] =
    useState<StudentInfo>({
      studentId: "",
      email: "",
      name: "",
      program: "",
      yearLevel: "",
    });

  const formatYearLevel = (year: number | null | undefined) => {
    switch (year) {
      case 1:
        return "1st Year";
      case 2:
        return "2nd Year";
      case 3:
        return "3rd Year";
      case 4:
        return "4th Year";
      default:
        return "";
    }
  };

  const getMissingFields = () => {
    const missing: string[] = [];

    if (!studentInfo.studentId.trim()) missing.push("Student ID");
    if (!studentInfo.name.trim()) missing.push("Name");
    if (!studentInfo.program.trim()) missing.push("Program");
    if (!studentInfo.yearLevel.trim()) missing.push("Year Level");
    if (!studentInfo.email.trim()) missing.push("Email");

    return missing;
  };

  const generateReference = () => {
    return Math.floor(
      10000000000 +
      Math.random() * 90000000000
    ).toString();
  };

  const validateForm = () => {
    if (
      selectedDocumentId === null &&
      missingFields.length > 0
    ) {
      setErrors([
        "Please select a document and complete your profile before proceeding.",
      ]);
      return false;
    }

    if (selectedDocumentId === null) {
      setErrors([
        "Please select a document before proceeding.",
      ]);
      return false;
    }

    if (missingFields.length > 0) {
      setErrors([
        "Please complete your profile before proceeding.",
      ]);
      return false;
    }

    setErrors([]);
    return true;
  };

  // =========================
  // FETCH PROFILE
  // =========================

  const fetchProfile = async () => {
    try {
      const token = await getStoredToken();

      if (!token) {
        setLoadingProfile(false);
        return;
      }

      const res = await fetch(ENDPOINTS.me, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const updatedStudentInfo = {
          studentId: String(data.id_number || ""),
          email: data.email || "",
          name: data.student_name || "",
          program: data.program || "",
          yearLevel: formatYearLevel(data.year_level),
        };

        setStudentInfo(updatedStudentInfo);

        const isProfileComplete =
          updatedStudentInfo.studentId.trim() &&
          updatedStudentInfo.name.trim() &&
          updatedStudentInfo.program.trim() &&
          updatedStudentInfo.yearLevel.trim() &&
          updatedStudentInfo.email.trim();

        if (isProfileComplete) {
          setErrors([]);
        }
      }
    } catch (error) {
      console.error(
        "Profile fetch error:",
        error
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  // =========================
  // FETCH DOCUMENTS
  // =========================

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/process/${procedureId}/documents/`
        );

        const data = await res.json();
        setDocuments(data);

      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };

    if (!isNaN(procedureId)) {
      fetchDocuments();
    }

  }, [procedureId]);

  const missingFields = getMissingFields();

  const hasStudentInfo = missingFields.length === 0;

  const canProceed = hasStudentInfo && selectedDocumentId !== null;

  const handleProceed = async () => {
    if (!validateForm()) return;

    const token = await getStoredToken();

    if (!token) {
      showAlert("Error", "You are not logged in.");
      return;
    }

    const response = await fetch(ENDPOINTS.submitReq, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        procedure: procedureId,
        document: selectedDocumentId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert("Error", data.error || "Failed to submit request.");
      return;
    }

    const selectedDocument = documents.find(
      (doc) => doc.document_id === selectedDocumentId
    );

    const today = new Date().toLocaleDateString();

    router.push({
      pathname: "/ConfirmationPage",
      params: {
        reference: data.reference_code,

        studentId: studentInfo.studentId,
        name: studentInfo.name,
        program: studentInfo.program,
        yearLevel: studentInfo.yearLevel,

        procedureId: String(procedureId),

        documentId: String(selectedDocument?.document_id ?? ""),
        documentName: selectedDocument?.document_name ?? "",

        date: today,
      },
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <Header title="Document Tracker" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.desktopContent,
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Track Document
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: colors.icon,
            },
          ]}
        >
          Select the type of document you need to track and provide your student information.
        </Text>
        {errors.length > 0 && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(239,68,68,0.18)"
                    : "rgba(220,38,38,0.12)",

                borderColor:
                  colorScheme === "dark"
                    ? "#EF4444"
                    : "#DC2626",
              },
            ]}
          >
            {errors.map((error, index) => (
              <View
                key={index}
                style={styles.errorRow}
              >
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={
                    colorScheme === "dark"
                      ? "#F87171"
                      : "#DC2626"
                  }
                />

                <Text
                  style={[
                    styles.errorText,
                    {
                      color:
                        colorScheme === "dark"
                          ? "#FCA5A5"
                          : "#DC2626",
                    },
                  ]}
                >
                  {error}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Available Documents
        </Text>

        <View style={styles.docListContainer}>
          {documents.map((doc) => (
            <DocList
              key={doc.document_id}
              icon="description"
              text={doc.document_name}
              selected={selectedDocumentId === doc.document_id}
              onPress={() => {
                setErrors([]);

                if (selectedDocumentId === doc.document_id) {
                  setSelectedDocumentId(null);
                } else {
                  setSelectedDocumentId(doc.document_id);
                }
              }}
            />
          ))}
        </View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Student Information
        </Text>

        <View
          style={styles.detailsContainer}
        >

          <InfoCard
            marginHorizontal={horizontalMargin}
            backgroundColor={colors.background}
            borderColor={
              colorScheme === "dark"
                ? "#2c346b"
                : "#FFFFFF"
            }
            shadow={
              colorScheme === "dark"
                ? "0px 4px 16px rgba(255, 255, 255, 0.1)"
                : "0px 4px 16px rgba(0, 0, 0, 0.12)"
            }
          >
            {loadingProfile ? (
              <Text
                style={[
                  styles.loadingText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Loading student
                information...
              </Text>
            ) : hasStudentInfo ? (
              <>
                <View
                  style={
                    styles.cardHeader
                  }
                >
                  <View style={styles.profileIcon}>
                    <MaterialIcons
                      name="person"
                      size={30}
                      color={
                        colorScheme ===
                          "dark"
                          ? "#ffffff"
                          : "#141A73"
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.cardTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Student Profile
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "#2c346b"
                          : "#E2E8F0",
                    },
                  ]}
                />

                <View style={styles.infoGroup}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Student ID
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {studentInfo.studentId}
                  </Text>
                </View>

                <View style={styles.infoGroup}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Name
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {studentInfo.name}
                  </Text>
                </View>

                <View style={styles.infoGroup}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Program
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {studentInfo.program}
                  </Text>
                </View>

                <View style={styles.infoGroup}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Year Level
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {studentInfo.yearLevel}
                  </Text>
                </View>

                <View style={styles.infoGroup}>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Email
                  </Text>

                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {studentInfo.email}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View
                  style={
                    styles.cardHeader
                  }
                >
                  <View
                    style={
                      styles.warningIcon
                    }
                  >
                    <MaterialIcons
                      name="warning"
                      size={18}
                      color={
                        colorScheme ===
                          "dark"
                          ? "#ffffff"
                          : "#141A73"
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={[
                        styles.cardTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Profile
                      Incomplete
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "#2c346b"
                          : "#E2E8F0",
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.messageText,
                    { color: colors.text },
                  ]}
                >
                  Missing fields :
                  {"\n"}
                  • {missingFields.join("\n• ")}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.profileButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={() =>
                    router.push(
                      "/Profile"
                    )
                  }
                >
                  <Text
                    style={
                      styles.profileButtonText
                    }
                  >
                    Complete Profile
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </InfoCard>
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            backgroundColor:
              colors.background,
          },]}
      >
        <TouchableOpacity
          onPress={handleProceed}
          style={[
            styles.ProceedBtn,
            {
              backgroundColor: colors.tint2,
            },
          ]}
        >
          <Text
            style={[
              styles.ProceedBtnText,
              { color: colors.background },
            ]}
          >
            Proceed
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  desktopContent: {
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },

  description: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 22,
  },

  detailsContainer: {
    width: "100%",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 12,
  },

  errorContainer: {
    backgroundColor: "rgba(220,38,38,0.12)",
    borderWidth: 0.1,
    borderRadius: 10,
    padding: 6,
    marginTop: 2,
  },

  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#DC2626",
    fontWeight: "600",
    lineHeight: 20,
  },

  docListContainer: {
    marginTop: 10,
  },

  loadingText: {
    textAlign: "center",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileIcon: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  warningIcon: {
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  incompleteText: {
    fontSize: 13,
    marginTop: 2,
  },

  divider: {
    height: 1,
    marginVertical: 16,
  },

  label: {
    fontSize: 17,
    fontWeight: "700",
  },

  infoGroup: {
    marginBottom: 18,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "400",
    marginTop: 3,
    lineHeight: 22,
  },

  messageText: {
    fontWeight: "600",
    textAlign: "left",
    lineHeight: 22,
    marginBottom: 18,
  },

  profileButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  profileButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  footer: {
    borderColor: "#d8d8d8",
    borderTopWidth: 0.5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  ProceedBtn: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  ProceedBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});