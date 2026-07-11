import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useColorScheme, useWindowDimensions, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import Header from "@/components/Universal Components/Header";
import { Colors } from "../constants/theme";

import { fetchActiveRequests, updateRequestStatus } from "@/lib/api";
import { useEffect } from "react";

type ActiveRequest = {
  request_id: number;

  procedure_name: string;

  student_name: string;
  id_number: string;
  program: string;
  year_level: number;
  email: string;

  document_name: string;
  reference_code: string;

  status: string;
  remarks: string | null;
  created_at: string;
};

export default function UserActiveReq() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isDesktop = width >= 1024;

  const { roleId, request } = useLocalSearchParams();

  const isAdmin = roleId === "2";

  const [selectedItem, setSelectedItem] = useState<ActiveRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [remarks, setRemarks] = useState("");

  const [selectedStatus, setSelectedStatus] = useState<
    "Approved" | "Rejected" | null
  >(null);

  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  useEffect(() => {
    if (isAdmin && request) {
      const parsedRequest = JSON.parse(request as string);

      setRequests([parsedRequest]);

      setTimeout(() => {
        openModal(parsedRequest);
      }, 300);

      setLoading(false);

      return;
    }

    loadActiveRequests();
  }, []);

  const openModal = (item: ActiveRequest) => {
    setSelectedItem(item);

    setRemarks(item.remarks ?? "");
    setSelectedStatus(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setRemarks("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem || !selectedStatus) {
      alert("Please select Approve or Reject first.");
      return;
    }

    try {
      await updateRequestStatus(
        selectedItem.request_id,
        selectedStatus,
        remarks
      );

      setSelectedItem({
        ...selectedItem,
        status: selectedStatus,
        remarks,
      });

      await loadActiveRequests();

      closeModal();

      showMessage(
        `Request ${selectedStatus.toLowerCase()} successfully.`
      );

    } catch (err) {
      console.log(err);
      alert("Failed to update request.");
    }
  };

  const getStatusStyle = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "confirmed":
        return styles.approved;

      case "rejected":
        return styles.rejected;

      default:
        return styles.pending;
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatYearLevel = (year?: number) => {
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
        return year ? `${year}th Year` : "";
    }
  };

  const loadActiveRequests = async () => {
    try {
      setLoading(true);

      const data = await fetchActiveRequests();

      console.log("API DATA");
      console.table(
        data.map((item: any) => ({
          document: item.document_name,
          procedure: item.procedure_name,
          remarks: item.remarks,
          status: item.status,
        }))
      );

      const grouped = Object.values(
        data.reduce((acc: any, item: ActiveRequest) => {
          if (!acc[item.procedure_name]) {
            acc[item.procedure_name] = {
              procedure: item.procedure_name,
              requests: [],
            };
          }

          acc[item.procedure_name].requests.push(item);

          return acc;
        }, {})
      );

      console.log("Grouped Data:", grouped);

      setRequests(grouped as any);
    } catch (err) {
      console.log("Active Request Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header title="Active Requests" />

      {message !== "" && (
        <View
          style={[
            styles.toast,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "#1F2937"
                  : "#DCFCE7",
            },
          ]}
        >
          <MaterialIcons
            name="check-circle"
            size={20}
            color="#16A34A"
          />

          <Text
            style={[
              styles.toastText,
              {
                color:
                  colorScheme === "dark"
                    ? "#FFFFFF"
                    : "#166534",
              },
            ]}
          >
            {message}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.container,
          isDesktop && styles.desktopContent,
        ]}
      >
        {isAdmin ? (
          requests.map((item: ActiveRequest) => (
            <TouchableOpacity
              key={item.request_id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.background,
                  borderColor:
                    colorScheme === "dark" ? "#2c346b" : "#FFFFFF",
                  boxShadow:
                    colorScheme === "dark"
                      ? "0px 4px 16px rgba(255,255,255,0.18)"
                      : "0px 5px 17px rgba(0,0,0,0.12)",
                },
              ]}
              onPress={() => openModal(item)}
            >
              <View
                style={[
                  styles.accentLine,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#EBA937" : "#141A73",
                  },
                ]}
              />

              <View style={styles.cardContent}>
                <View style={styles.content}>
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: colors.text },
                    ]}
                  >
                    {item.document_name}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      getStatusStyle(item.status),
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            selectedItem?.status?.toLowerCase() === "approved"
                              ? "#065F46"
                              : selectedItem?.status?.toLowerCase() === "rejected"
                                ? "#991B1B"
                                : "#92400E",
                        },
                      ]}
                    >
                      {formatStatus(item.status)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.openModalText,
                    {
                      color:
                        colorScheme === "dark"
                          ? "#EBA937"
                          : "#141A73",
                    },
                  ]}
                >
                  View
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          requests.map((group: any) => (
            <View key={group.procedure}>
              <Text
                style={[
                  styles.procedureTitle,
                  { color: colors.text },
                ]}
              >
                {group.procedure}
              </Text>

              {group.requests.map((item: ActiveRequest) => (
                <TouchableOpacity
                  key={item.request_id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.background,
                      borderColor:
                        colorScheme === "dark"
                          ? "#2c346b"
                          : "#FFFFFF",

                      boxShadow:
                        colorScheme === "dark"
                          ? "0px 4px 16px rgba(255,255,255,0.18)"
                          : "0px 5px 17px rgba(0,0,0,0.12)",
                    },
                  ]}
                  onPress={() => openModal(item)}
                >
                  <View
                    style={[
                      styles.accentLine,
                      {
                        backgroundColor:
                          colorScheme === "dark"
                            ? "#EBA937"
                            : "#141A73",
                      },
                    ]}
                  />

                  <View style={styles.cardContent}>
                    <View style={styles.content}>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: colors.text },
                        ]}
                      >
                        {item.document_name}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          getStatusStyle(item.status),
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                selectedItem?.status?.toLowerCase() === "approved"
                                  ? "#065F46"
                                  : selectedItem?.status?.toLowerCase() === "rejected"
                                    ? "#991B1B"
                                    : "#92400E",
                            },
                          ]}
                        >
                          {formatStatus(item.status)}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.openModalText,
                        {
                          color:
                            colorScheme === "dark"
                              ? "#EBA937"
                              : "#141A73",
                        },
                      ]}
                    >
                      View
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      < Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        onDismiss={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                width: isMobile ? "90%" : "38%",
                maxWidth: 650,
                backgroundColor: colors.background,
                borderColor:
                  colorScheme === "dark"
                    ? "#2c346b"
                    : "#FFFFFF",
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.modalScrollContent}
              style={styles.modalScroll}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {selectedItem?.document_name}
                </Text>
              </View>

              {!isAdmin && (
                <>
                  {/* Status */}
                  <View style={styles.infoGroup}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.text },
                      ]}
                    >
                      Status
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        getStatusStyle(selectedItem?.status),
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              selectedItem?.status?.toLowerCase() === "approved"
                                ? "#065F46"
                                : selectedItem?.status?.toLowerCase() === "rejected"
                                  ? "#991B1B"
                                  : "#92400E",
                          },
                        ]}
                      >
                        {formatStatus(selectedItem?.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Reference Number */}
                  <View style={styles.infoGroup}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.text },
                      ]}
                    >
                      Reference Number
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        { color: colors.text },
                      ]}
                    >
                      {selectedItem?.reference_code}
                    </Text>
                  </View>
                </>
              )}
              {isAdmin && (
                <>
                  <View style={styles.infoGroup}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.text },
                      ]}
                    >
                      ID Number
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        { color: colors.text },
                      ]}
                    >
                      {selectedItem?.id_number}
                    </Text>
                  </View>

                  <View style={styles.infoGroup}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.text },
                      ]}
                    >
                      Student Name
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        { color: colors.text },
                      ]}
                    >
                      {selectedItem?.student_name}
                    </Text>
                  </View>

                  <View style={styles.infoGroup}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.text },
                      ]}
                    >
                      Program
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        { color: colors.text },
                      ]}
                    >
                      {selectedItem?.program}
                    </Text>
                  </View>

                  <View style={styles.infoGroup}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.text },
                      ]}
                    >
                      Year Level
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        { color: colors.text },
                      ]}
                    >
                      {formatYearLevel(selectedItem?.year_level)}
                    </Text>
                  </View>

                  <View style={styles.infoGroup}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: colors.text },
                      ]}
                    >
                      Email
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        { color: colors.text },
                      ]}
                    >
                      {selectedItem?.email}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.infoGroup}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Date Submitted
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {selectedItem?.created_at?.split("T")[0]}
                </Text>
              </View>

              {isAdmin && (
                <View style={styles.infoGroup}>
                  <Text
                    style={[
                      styles.infoLabel,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    Update Status
                  </Text>

                  <View
                    style={[
                      styles.statusActions,
                      isMobile && styles.statusActionsMobile,
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.approveButton,
                        isMobile && styles.mobileActionButton,
                      ]}
                      onPress={() => setSelectedStatus("Approved")}
                    >
                      <Text style={styles.actionButtonText}>
                        Approve
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.rejectButton,
                        isMobile && styles.mobileActionButton,
                      ]}
                      onPress={() => setSelectedStatus("Rejected")}
                    >
                      <Text style={styles.actionButtonText}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Remarks */}
              <View style={styles.infoGroup}>
                <Text
                  style={[
                    styles.noteLabel,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Remarks
                </Text>

                <View
                  style={[
                    styles.remarksBox,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "#111827"
                          : "#F8FAFC",

                      borderColor:
                        colorScheme === "dark"
                          ? "#2c346b"
                          : "#E2E8F0",
                    },
                  ]}
                >
                  {isAdmin ? (
                    <TextInput
                      value={remarks}
                      onChangeText={setRemarks}
                      multiline
                      placeholder="Enter remarks..."
                      placeholderTextColor="#9CA3AF"
                      style={[
                        styles.noteText,
                        {
                          color: colors.text,
                          minHeight: 80,
                          textAlignVertical: "top",
                        },
                      ]}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.noteText,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {selectedItem?.remarks || "No remarks yet."}
                    </Text>
                  )}
                </View>

                {isAdmin && (
                  <View
                    style={[
                      styles.infoGroup,
                      styles.sectionSpacing,
                    ]}
                  >
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      Reference Number
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {selectedItem?.reference_code}
                    </Text>
                  </View>
                )}
              </View>


              {/* Close */}
              <TouchableOpacity style={[
                styles.closeBtn,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "#EBA937"
                      : "#141A73",
                },
              ]} onPress={() => {
                if (isAdmin) {
                  handleUpdateStatus();
                } else {
                  closeModal();
                }
              }}>
                <Text
                  style={[
                    styles.closeText,
                    {
                      color: colors.background,
                    },
                  ]}
                >
                  {isAdmin ? "Update" : "Close"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },

  container: {
    paddingVertical: 20,
    paddingBottom: 40,
  },

  desktopContent: {
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },

  toast: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  toastText: {
    fontSize: 14,
    fontWeight: "600",
  },

  procedureSection: {
    marginBottom: 30,
  },

  procedureTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    marginHorizontal: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 30,
  },

  accentLine: {
    width: 5,
    alignSelf: "stretch",
    borderRadius: 10,
    marginRight: 14,
  },

  content: {
    flex: 1,
    paddingRight: 10,
  },

  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 5,
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginTop: 2,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  openModalText: {
    fontSize: 14,
    fontWeight: "600",
  },

  approved: {
    backgroundColor: "#D1FAE5",
  },

  pending: {
    backgroundColor: "#FEF3C7",
  },

  rejected: {
    backgroundColor: "#FEE2E2",
  },

  text: {
    fontSize: 14,
  },

  bold: {
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    maxHeight: "80%",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },

  modalScrollContent: {
    paddingBottom: 10,
    paddingRight: 12,
  },

  modalScroll: {
    marginRight: -8,
  },

  modalHeader: {
    marginBottom: 5,
    alignItems: "center",
  },

  infoGroup: {
    marginBottom: 18,
  },

  infoLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 16,
    lineHeight: 22,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
    alignItems: "center",
  },

  modalText: {
    fontSize: 14,
    marginBottom: 6,
  },

  statusActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  statusActionsMobile: {
    flexDirection: "column",
  },

  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  mobileActionButton: {
    marginHorizontal: 0,
    marginBottom: 10,
  },

  approveButton: {
    backgroundColor: "#21b155",
    borderRadius: 20,
  },

  rejectButton: {
    backgroundColor: "#da3d3d",
    borderRadius: 20,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  remarksBox: {
    borderRadius: 7,
    padding: 10,
    borderWidth: 1,
  },

  sectionSpacing: {
    marginTop: 18,
  },

  noteLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  noteText: {
    fontSize: 14,
    lineHeight: 22,
  },

  closeBtn: {
    marginTop: 5,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  closeText: {
    fontWeight: "600",
  },
});