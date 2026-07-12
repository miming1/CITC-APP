import React from "react";
import {
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import StatusBadge from "../Universal Components/StatusBadge";

interface Props {
    item: any;
    colors: any;
    colorScheme: "light" | "dark";
    styles: any;
    openModal: (item: any) => void;
    isAdmin: boolean;
}

export default function ActiveRequestCard({
    item,
    colors,
    colorScheme,
    styles,
    openModal,
    isAdmin,
}: Props) {
    return (
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
                            ? "0px 4px 16px rgba(255,255,255,0.05)"
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

                    <StatusBadge status={item.status} />

                    {item.status === "Rejected" &&
                        item.days_remaining !== null && (
                            <Text
                                style={[
                                    styles.countdownText,
                                    {
                                        color: isAdmin
                                            ? colorScheme === "dark"
                                                ? "#F3F4F6"
                                                : "#242020"
                                            : colorScheme === "dark"
                                                ? item.days_remaining <= 2
                                                    ? "#FF6B6B"   // brighter red
                                                    : item.days_remaining <= 4
                                                        ? "#FDBA74" // brighter orange
                                                        : "#4ADE80" // brighter green
                                                : item.days_remaining <= 2
                                                    ? "#DC2626"   // red
                                                    : item.days_remaining <= 4
                                                        ? "#EA580C" // orange
                                                        : "#15803D",// green
                                    },
                                ]}
                            >
                                {item.days_remaining}{" "}
                                {item.days_remaining === 1
                                    ? "day"
                                    : "days"} remaining
                            </Text>
                        )}

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
    );
}