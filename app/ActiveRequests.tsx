import ActiveRequestCard from "@/components/Universal Components/ActiveRequestCard";
import ActiveRequestModal from "@/components/Universal Components/ActiveRequestModal";
import Header from "@/components/Universal Components/Header";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View, useColorScheme, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";

import { fetchActiveRequests, updateRequestStatus } from "@/lib/api";
import React, { useCallback, useState } from "react";

type ActiveRequest = {
  request_id: number;

  procedure_name: string;
  office_name: string;

  student_name: string;
  id_number: string;
  program: string;
  year_level: number;
  email: string;

  document_name: string;
  reference_code: string;

  status: string;
  remarks: string | null;
  days_remaining: number | null;
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

  const [remarksFocused, setRemarksFocused] = useState(false);

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

  useFocusEffect(
    useCallback(() => {

      if (isAdmin && request) {
        const parsedRequest = JSON.parse(request as string);

        // Load the normal active request list
        loadActiveRequests();

        // Then automatically open the searched request
        setTimeout(() => {
          openModal(parsedRequest);
        }, 500);

        return;
      }

      loadActiveRequests();

    }, [request, isAdmin])
  );

  const openModal = (item: ActiveRequest) => {
    setSelectedItem(item);

    setRemarks(item.remarks ?? "");
    setSelectedStatus(null);
    setModalVisible(true);
  };

  const closeModal = async () => {
    setSelectedStatus(null);
    setRemarks("");
    setModalVisible(false);

    await loadActiveRequests();

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

      setRequests(grouped as any);

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
        rstyles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header
    title="Active Requests"
    roleId={roleId as string}
    adminMode="true"
    />

      {message !== "" && (
        <View
          style={[
            rstyles.toast,
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
              rstyles.toastText,
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
          rstyles.container,
          isDesktop && rstyles.desktopContent,
        ]}
      >
        <View
          style={[
            rstyles.disclaimerBox,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "#1F2937"
                  : "#FEF3C7",

              borderColor:
                colorScheme === "dark"
                  ? "#FACC15"
                  : "#FACC15",
            },
          ]}
        >
          <MaterialIcons
            name="info-outline"
            size={20}
            color={
              colorScheme === "dark"
                ? "#FCD34D"
                : "#B45309"
            }
          />

          <Text
            style={[
              rstyles.disclaimerText,
              {
                color:
                  colorScheme === "dark"
                    ? "#F9FAFB"
                    : "#92400E",
              },
            ]}
          >
            Rejected requests remain active for 7 days to allow follow-up. If no follow-up is made within 7 days, the request is automatically moved to History.
          </Text>
        </View>
        {isAdmin ? (
          requests.map((group: any) => (
            <View key={group.procedure}>
              <Text
                style={[
                  rstyles.procedureTitle,
                  { color: colors.text },
                ]}
              >
                {group.procedure}
              </Text>

              {group.requests.map((item: ActiveRequest) => (
                <ActiveRequestCard
                  key={item.request_id}
                  item={item}
                  colors={colors}
                  colorScheme={colorScheme}
                  styles={rstyles}
                  openModal={openModal}
                  isAdmin={isAdmin}
                />
              ))}
            </View>
          ))
        ) : (

          requests.map((group: any) => (
            <View key={group.procedure}>
              <Text
                style={[
                  rstyles.procedureTitle,
                  { color: colors.text },
                ]}
              >
                {group.procedure}
              </Text>

              {group.requests.map((item: ActiveRequest) => (
                <ActiveRequestCard
                  key={item.request_id}
                  item={item}
                  colors={colors}
                  colorScheme={colorScheme}
                  styles={rstyles}
                  openModal={openModal}
                  isAdmin={isAdmin}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      <ActiveRequestModal
        modalVisible={modalVisible}
        closeModal={closeModal}
        selectedItem={selectedItem}
        isAdmin={isAdmin}
        isMobile={isMobile}
        colors={colors}
        colorScheme={colorScheme}
        styles={rstyles}
        remarks={remarks}
        setRemarks={setRemarks}
        remarksFocused={remarksFocused}
        setRemarksFocused={setRemarksFocused}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        handleUpdateStatus={handleUpdateStatus}
        formatYearLevel={formatYearLevel}
      />
    </SafeAreaView >
  );
}

export const rstyles = StyleSheet.create({
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

  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,

    marginHorizontal: 30,
    marginBottom: 18,

    padding: 10,

    borderRadius: 10,
    borderWidth: 1,
  },

  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
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

  countdownText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },

  openModalText: {
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 14,
    padding: 22,
    elevation: 5,
  },

  modalScrollContent: {
    paddingBottom: 10,
    paddingRight: 12,
  },

  modalScroll: {
    marginRight: -8,
  },

  closeIcon: {
    position: "absolute",
    top: 18,
    right: 40,
    zIndex: 100,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
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
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: "center",

    borderWidth: 5,
    borderColor: "transparent",
  },

  mobileActionButton: {
    marginHorizontal: 0,
    marginBottom: 10,
  },

  selectedApproveButton: {
    borderColor: "#aeff00",
  },

  selectedRejectButton: {
    borderColor: "#ff6200",
  },

  approveButton: {
    backgroundColor: "#16df5f",
    borderRadius: 15,
  },

  rejectButton: {
    backgroundColor: "#d8212a",
    borderRadius: 15,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  remarksInput: {
    borderWidth: 1,
    borderRadius: 12,

    paddingHorizontal: 12,
    paddingVertical: 10,

    fontSize: 14,
    lineHeight: 22,

    minHeight: 80,

    textAlignVertical: "top",
    marginHorizontal: 3,
  },

  sectionSpacing: {
    marginTop: 4,
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