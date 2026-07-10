import { useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, useWindowDimensions, View, } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "@/components/Universal Components/Header";
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

  const isDesktop = width >= 1024;

  const [documents, setDocuments] = useState<Document[]>([]);

  const [selectedDocumentIds, setSelectedDocumentIds] =
    useState<number[]>([]);

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
      selectedDocumentIds.length === 0 &&
      missingFields.length > 0
    ) {
      setErrors([
        "Please select at least one document and complete your profile before proceeding.",
      ]);
      return false;
    }

    if (selectedDocumentIds.length === 0) {
      setErrors([
        "Please select at least one document before proceeding.",
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

  const canProceed = hasStudentInfo && selectedDocumentIds.length > 0;

  const handleProceed = () => {
    if (!validateForm()) return;

    const reference = generateReference();

    router.push({
      pathname: "/ConfirmationPage",
      params: {
        procedureId: String(procedureId),
        documentIds: JSON.stringify(selectedDocumentIds),
        studentId: studentInfo.studentId,
        reference,
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
          Choose Documents to Track
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: colors.icon,
            },
          ]}
        >
          Select one or more documents you want to track.
        </Text>

        {documents.map((doc) => (
          <DocList
            key={doc.document_id}
            icon="description"
            text={doc.document_name}
            selected={selectedDocumentIds.includes(doc.document_id)}
            onPress={() => {
              setErrors([]);
              if (selectedDocumentIds.includes(doc.document_id)) {
                setSelectedDocumentIds(
                  selectedDocumentIds.filter(
                    (id) => id !== doc.document_id
                  )
                );
              } else {
                setSelectedDocumentIds([
                  ...selectedDocumentIds,
                  doc.document_id,
                ]);
              }
            }}
          />
        ))}



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
        <View
          style={styles.detailsContainer}
        >
          <Text
            style={[
              styles.detailsTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Student Information
          </Text>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.background,

                borderColor:
                  colorScheme === "dark"
                    ? "#2c346b"
                    : "#FFFFFF",

                boxShadow:
                  colorScheme === "dark"
                    ? "0px 4px 16px rgba(255,255,255,0.08)"
                    : "0px 4px 16px rgba(0,0,0,0.12)",
              },
            ]}
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

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        colors.icon,
                    },
                  ]}
                >
                  Student ID
                </Text>

                <Text
                  style={[
                    styles.studentId,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    studentInfo.studentId
                  }
                </Text>

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        colors.icon,
                      marginTop: 16,
                    },
                  ]}
                >
                  Name
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {studentInfo.name}
                </Text>

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        colors.icon,
                      marginTop: 16,
                    },
                  ]}
                >
                  Program
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    studentInfo.program
                  }
                </Text>

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        colors.icon,
                      marginTop: 16,
                    },
                  ]}
                >
                  Year Level
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    studentInfo.yearLevel
                  }
                </Text>

                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        colors.icon,
                      marginTop: 16,
                    },
                  ]}
                >
                  Email
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {studentInfo.email}
                </Text>
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
          </View>
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
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  description: {
    marginBottom: 10,
  },

  detailsContainer: {
    width: "100%",
  },

  detailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 10,
  },

  errorContainer: {
    backgroundColor: "rgba(220,38,38,0.12)",
    borderWidth: 0.1,
    borderRadius: 10,
    padding: 8,
    marginTop: 2,
    marginBottom: 10,
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

  infoCard: {
    borderRadius: 18,
    padding: 20,
    borderWidth: 0.1,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    fontSize: 16,
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
    fontSize: 13,
  },

  studentId: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
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
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    paddingVertical: 20,
  },

  ProceedBtn: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },

  ProceedBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});