import QRCode from "react-native-qrcode-svg";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import InfoCard from "@/components/InfoCard";
import { useLocalSearchParams, useRouter, } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../constants/api";
import { getStoredToken } from "../lib/tokenStore";
import { Colors } from "../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

export default function TrackingDetailsScreen() {
    const router = useRouter();

    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];

    const { width } = useWindowDimensions();
    const horizontalMargin = width > 768 ? 100 : 20;

    const isDesktop = width >= 768;

    const {
        reference,
        studentId,
        name,
        program,
        yearLevel,
        documentName,
        date,
        procedureId,
    } = useLocalSearchParams();

    const [offices, setOffices] = useState<string[]>([]);

    useEffect(() => {
        const fetchOffices = async () => {
            try {
                const token = await getStoredToken();

                const res = await fetch(
                    `${API_BASE_URL}/process/${procedureId}/offices/`,
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );

                const data = await res.json();

                if (res.ok) {
                    setOffices(data.map((item: any) => item.office_name));
                } else {
                    console.log(data);
                }
            } catch (err) {
                console.log(err);
            }
        };

        if (procedureId) {
            fetchOffices();
        }
    }, [procedureId]);


    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    isDesktop && styles.desktopContent,
                ]}
            >
                {/* TOP */}
                <View style={styles.topSection}>
                    <FontAwesome
                        name="check-circle"
                        size={40}
                        color="#22C55E"
                    />

                    <Text
                        style={[
                            styles.successText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        Request Submitted Successfully!
                    </Text>

                    <View>
                        <QRCode
                            value={String(reference || "")}
                            size={180}
                        />

                        <Text
                            style={[
                                styles.qrLabel,
                                {
                                    color: colors.icon,
                                },
                            ]}
                        >
                            Tracking Code
                        </Text>

                        <Text
                            style={[
                                styles.refNum,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {reference || "-"}
                        </Text>
                    </View>
                </View>

                {/* DETAILS */}
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
                            : "0px 5px 17px rgba(0, 0, 0, 0.12)"
                    }
                >

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
                            {studentId || "-"}
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
                            {name || "-"}
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
                            {program || "-"}
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
                            {yearLevel || "-"}
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
                            Document
                        </Text>

                        <Text
                            style={[
                                styles.infoValue,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {documentName || "-"}
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
                            {date || "-"}
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
                            Office
                        </Text>

                        {offices.length > 0 ? (
                            offices.map((office, index) => (
                                <Text
                                    key={index}
                                    style={[
                                        styles.infoValue,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    {office}
                                </Text>
                            ))
                        ) : (
                            <Text
                                style={[
                                    styles.infoValue,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                Loading...
                            </Text>
                        )}
                    </View>

                </InfoCard>

                {/* FOOTER BUTTONS */}
                <View
                    style={[
                        styles.footer,
                        {
                            backgroundColor: colors.background,
                        },
                    ]}
                >

                    <TouchableOpacity
                        style={[
                            styles.backBtn,
                            {
                                backgroundColor: colors.tint,
                            },
                        ]}
                        onPress={() => router.replace("/Userdashboard")}
                    >
                        <Text style={
                            styles.backText}>
                            Back to Home
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.viewBtn,
                            {
                                backgroundColor: colors.tint2,
                                borderColor: colors.tint2,
                            },
                        ]}
                        onPress={() => router.push("/active-req")}
                    >
                        <Text style={[
                            styles.viewText,
                            { color: colors.background },
                        ]}>
                            View Request
                        </Text>
                    </TouchableOpacity>

                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },

    desktopContent: {
        width: "95%",
        maxWidth: 1600,
        alignSelf: "center",
    },

    content: {
        padding: 20,
        paddingBottom: 120,
    },

    topSection: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
    },

    successText: {
        fontSize: 13,
        fontWeight: "500",
        marginTop: 10,
        marginBottom: 20,
    },

    qrLabel: {
        marginTop: 16,
        fontSize: 14,
        color: "#777",
        alignSelf: "center",
    },

    refNum: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: "700",
        letterSpacing: 2,
        alignSelf: "center",
    },

    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
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

    infoGroup: {
        marginBottom: 18,
    },

    infoValue: {
        fontSize: 16,
        fontWeight: "400",
        marginTop: 3,
        lineHeight: 22,
    },

    divider: {
        height: 1,
        marginVertical: 16,
    },

    label: {
        fontSize: 17,
        fontWeight: "700",
    },


    /* ✅ FIXED FOOTER LAYOUT */
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
        marginTop: 25,
    },

    /* Buttons equal sizing for perfect alignment */
    backBtn: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: 220,
        maxWidth: "45%",
        alignItems: "center",
    },

    viewBtn: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: 220,
        maxWidth: "45%",
        alignItems: "center",
    },

    backText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },

    viewText: {
        fontSize: 15,
        fontWeight: "700",
    },
});