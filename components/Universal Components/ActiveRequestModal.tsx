import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import StatusBadge from "../Universal Components/StatusBadge";

type Props = {
    modalVisible: boolean;
    closeModal: () => void;
    selectedItem: any;
    isAdmin: boolean;
    isHistory?: boolean;
    isMobile: boolean;
    colors: any;
    colorScheme: string;
    styles: any;
    remarks: string;
    setRemarks: (v: string) => void;
    remarksFocused: boolean;
    setRemarksFocused: (v: boolean) => void;
    selectedStatus: "Approved" | "Rejected" | null;
    setSelectedStatus: (
        value: "Approved" | "Rejected"
    ) => void;
    handleUpdateStatus: () => void;
    formatYearLevel: (year?: number) => string;
};

export default function ActiveRequestModal({
    modalVisible,
    closeModal,
    selectedItem,
    isAdmin,
    isHistory = false,
    isMobile,
    colors,
    colorScheme,
    styles,
    remarks,
    setRemarks,
    remarksFocused,
    setRemarksFocused,
    selectedStatus,
    setSelectedStatus,
    handleUpdateStatus,
    formatYearLevel,
}: Props) {
    return (
        <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
        >
            <View style={styles.modalOverlay}>
                <View
                    style={[
                        styles.modalCard,
                        {
                            width: isMobile ? "90%" : "45%",
                            maxWidth: 650,
                            backgroundColor: colors.background,
                            borderColor:
                                colorScheme === "dark"
                                    ? "#2c346b"
                                    : "#FFFFFF",
                        },
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.closeIcon,
                            {
                                backgroundColor:
                                    colorScheme === "dark"
                                        ? "#1F2937"
                                        : "#FFFFFF",
                            },
                        ]}
                        onPress={closeModal}
                    >
                        <MaterialIcons
                            name="close"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    <ScrollView
                        style={styles.modalScroll}
                        contentContainerStyle={styles.modalScrollContent}
                        showsVerticalScrollIndicator
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
                                <View style={styles.infoGroup}>
                                    <Text
                                        style={[
                                            styles.infoLabel,
                                            { color: colors.text },
                                        ]}
                                    >
                                        Status
                                    </Text>

                                    <StatusBadge
                                        status={selectedItem?.status}
                                    />
                                </View>

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

                                <View style={styles.infoGroup}>
                                    <Text
                                        style={[
                                            styles.infoLabel,
                                            { color: colors.text },
                                        ]}
                                    >
                                        Office
                                    </Text>

                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {selectedItem?.office_name}
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
                                        {selectedItem?.student_id_number ?? selectedItem?.id_number}
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
                                        {selectedItem?.student_name ?? "N/A"}
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
                                        {formatYearLevel(
                                            selectedItem?.year_level
                                        )}
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
                                    { color: colors.text },
                                ]}
                            >
                                Date Submitted
                            </Text>

                            <Text
                                style={[
                                    styles.infoValue,
                                    { color: colors.text },
                                ]}
                            >
                                {selectedItem?.created_at?.split("T")[0]}
                            </Text>
                        </View>

                        {isAdmin && !isHistory && (
                            <View style={styles.infoGroup}>
                                <Text
                                    style={[
                                        styles.infoLabel,
                                        { color: colors.text },
                                    ]}
                                >
                                    Update Status
                                </Text>

                                <View
                                    style={[
                                        styles.statusActions,
                                        isMobile &&
                                        styles.statusActionsMobile,
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            styles.approveButton,
                                            selectedStatus ===
                                            "Approved" &&
                                            styles.selectedApproveButton,
                                        ]}
                                        onPress={() =>
                                            setSelectedStatus("Approved")
                                        }
                                    >
                                        <Text
                                            style={styles.actionButtonText}
                                        >
                                            Approve
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            styles.rejectButton,
                                            selectedStatus ===
                                            "Rejected" &&
                                            styles.selectedRejectButton,
                                        ]}
                                        onPress={() =>
                                            setSelectedStatus("Rejected")
                                        }
                                    >
                                        <Text
                                            style={styles.actionButtonText}
                                        >
                                            Reject
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.infoGroup}>
                            <Text
                                style={[
                                    styles.noteLabel,
                                    { color: colors.text },
                                ]}
                            >
                                Remarks
                            </Text>

                            {isAdmin && !isHistory ? (
                                <TextInput
                                    value={remarks}
                                    onChangeText={setRemarks}
                                    multiline
                                    placeholder="Enter remarks..."
                                    placeholderTextColor="#9CA3AF"
                                    onFocus={() =>
                                        setRemarksFocused(true)
                                    }
                                    onBlur={() =>
                                        setRemarksFocused(false)
                                    }
                                    style={[
                                        styles.remarksInput,
                                        {
                                            color: colors.text,
                                            borderColor:
                                                remarksFocused
                                                    ? "#2563EB"
                                                    : colorScheme ===
                                                        "dark"
                                                        ? "#2c346b"
                                                        : "#E2E8F0",
                                            backgroundColor:
                                                colorScheme === "dark"
                                                    ? "rgba(255,255,255,0.05)"
                                                    : "#F8FAFC",
                                        },
                                    ]}
                                />
                            ) : (
                                <Text
                                    style={[
                                        styles.remarksInput,
                                        {
                                            backgroundColor:
                                                colorScheme === "dark"
                                                    ? "rgba(255,255,255,0.05)"
                                                    : "#F8FAFC",
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    {selectedItem?.remarks
                                        ? selectedItem.remarks
                                        : "No remarks given."}
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

                        <TouchableOpacity
                            style={[
                                styles.closeBtn,
                                {
                                    backgroundColor:
                                        colorScheme === "dark"
                                            ? "#EBA937"
                                            : "#141A73",
                                },
                            ]}
                            onPress={() => {
                                if (isAdmin && !isHistory)
                                    handleUpdateStatus();
                                else
                                    closeModal();
                            }}
                        >
                            <Text
                                style={[
                                    styles.closeText,
                                    {
                                        color: colors.background,
                                    },
                                ]}
                            >
                                {isAdmin && !isHistory
                                    ? "Update"
                                    : "Close"}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}