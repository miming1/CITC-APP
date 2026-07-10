import { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RequestItem = {
  title: string;
  studentId: string;
  refNum: string;
  date: string;
  status: "pending" | "approved" | "rejected" | string;
  note?: string;
};

const mockData: RequestItem[] = [
  {
    title: "Medical Certificate \nSubmission",
    studentId: "2023045033",
    refNum: "67353279301",
    date: "2026-04-07",
    status: "pending",
    note: "Your document is still under review.\nPlease allow some time for processing.",
  },
  {
    title: "INC Form Submission",
    studentId: "2023045033",
    refNum: "67353279301",
    date: "2026-03-28",
    status: "approved",
    note: "Your document has been approved.\nPlease check your email for further instructions.",
  },
  {
    title: "Excuse Letter Submission",
    studentId: "2023045033",
    refNum: "67353279301",
    date: "2026-02-11",
    status: "rejected",
    note: "Your submission was rejected.\nPlease review your document and resubmit.",
  },
];

export default function UserActiveReq() {
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Active Requests</Text>

        {mockData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => openModal(item)}
          >
            <View style={styles.statusContainer}>
              <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>
                {formatStatus(item.status)}
              </Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>

            <Text style={styles.text}>
              <Text style={styles.bold}>Date: </Text>
              {item.date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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

  pageTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
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

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
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