import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme, useWindowDimensions, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

import Header from "@/components/Header";
import { Colors } from "../constants/theme";

type RequestItem = {
  title: string;
  studentId: string;
  refNum: string;
  date: string;
  status: "pending" | "approved" | "rejected" | string;
  note?: string;
};

type ProcedureGroup = {
  procedure: string;
  requests: RequestItem[];
};

const mockData: ProcedureGroup[] = [
  {
    procedure: "Request for Exam",
    requests: [
      {
        title: "Medical Certificate",
        studentId: "2023045033",
        refNum: "0001-00000001",
        date: "2026-04-07",
        status: "pending",
        note: "Your document is still under review.",
      },
      {
        title: "Excuse Letter",
        studentId: "2023045033",
        refNum: "0001-00000002",
        date: "2026-04-08",
        status: "approved",
        note: "Approved successfully.",
      },
    ],
  },

  {
    procedure: "Graduation Clearance",
    requests: [
      {
        title: "Clearance Form",
        studentId: "2023045033",
        refNum: "0003-00000001",
        date: "2026-05-02",
        status: "pending",
        note: "Waiting for office approval.",
      },
    ],
  },
];

export default function UserActiveReq() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { width } = useWindowDimensions();

  const horizontalMargin = width > 768 ? 100 : 20;

  const isDesktop = width >= 1024;

  const [selectedItem, setSelectedItem] = useState<RequestItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = (item: RequestItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const getStatusStyle = (status?: string) => {
    switch (status) {
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

      <ScrollView
        contentContainerStyle={[
          styles.container,
          isDesktop && styles.desktopContent,
        ]}
      >
        {mockData.map((group, index) => (
          <View
            key={index}
            style={[
              styles.procedureSection,
              {
                marginHorizontal: horizontalMargin,
              },
            ]}
          >
            <Text
              style={[
                styles.procedureTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {group.procedure}
            </Text>

            {group.requests.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.card}
                onPress={() => openModal(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.documentInfo}>
                    <MaterialIcons
                      name="description"
                      size={24}
                      color={colors.tint}
                    />

                    <Text
                      style={[
                        styles.cardTitle,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.statusBadge,
                      getStatusStyle(item.status),
                    ]}
                  >
                    {formatStatus(item.status)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.cardLabel,
                    {
                      color: colors.icon,
                    },
                  ]}
                >
                  Reference Code
                </Text>

                <Text
                  style={[
                    styles.referenceNumber,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {item.refNum}
                </Text>

                <Text
                  style={[
                    styles.cardDate,
                    {
                      color: colors.icon,
                    },
                  ]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {selectedItem?.title}
            </Text>

            <Text style={styles.modalText}>
              <Text style={styles.bold}>Student ID: </Text>
              {selectedItem?.studentId}
            </Text>

            <Text style={styles.modalText}>
              <Text style={styles.bold}>Reference No: </Text>
              {selectedItem?.refNum}
            </Text>

            <Text style={styles.modalText}>
              <Text style={styles.bold}>Date: </Text>
              {selectedItem?.date}
            </Text>

            {/* Attachments */}
            <View style={styles.imgContainer}>
              <Text style={styles.modalText}>
                <Text style={styles.bold}>Attachments</Text>
              </Text>

              <View style={styles.imgBox} />
            </View>

            {/* Status */}
            <View style={styles.statusRow}>
              <Text style={styles.bold}>Status: </Text>
              <Text
                style={[
                  styles.statusBadge,
                  getStatusStyle(selectedItem?.status),
                ]}
              >
                {formatStatus(selectedItem?.status)}
              </Text>
            </View>

            {/* Note */}
            {selectedItem?.note && (
              <Text style={styles.noteText}>
                {selectedItem.note}
              </Text>
            )}

            {/* Close */}
            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 20 },

  desktopContent: {
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },

  procedureSection: {
    marginBottom: 30,
  },

  procedureTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
    flexShrink: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  cardLabel: {
    fontSize: 12,
    marginTop: 16,
  },

  referenceNumber: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },

  cardDate: {
    marginTop: 14,
    fontSize: 13,
  },

  statusContainer: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  statusBadge: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  approved: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },

  pending: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },

  rejected: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
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
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  modalText: {
    fontSize: 14,
    marginBottom: 6,
  },

  imgContainer: {
    alignSelf: "flex-start",
  },

  imgBox: {
    width: 160,
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#78757e",
    backgroundColor: "#ffffff",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  noteText: {
    marginTop: 12,
    fontSize: 14,
    color: "#444",
    lineHeight: 18,
  },

  closeBtn: {
    marginTop: 15,
    backgroundColor: "#9B7FD4",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  closeText: {
    color: "#fff",
    fontWeight: "600",
  },
});