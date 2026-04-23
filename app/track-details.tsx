import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";

export default function TrackerScreen() {
    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];
    const router = useRouter();

    const { ref } = useLocalSearchParams();

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView contentContainerStyle={styles.content}>

                {/* TOP */}
                <View style={styles.topSection}>
                    <FontAwesome
                        name="check-circle"
                        size={120}
                        color="#9B7FD4"
                    />
                    <Text style={styles.ref}>Reference No</Text>
                    <Text style={styles.refNum}>{ref || "No Reference"}</Text>
                </View>

                {/* ✅ QR CODE CONTAINER (placeholder only) */}
                <View style={styles.qrContainer}>
                    <View style={styles.qrBox}>
                        <Text style={styles.qrText}>QR CODE</Text>
                    </View>

                    <Text style={styles.qrLabel}>
                        Scan this code for tracking</Text>
                </View>

                {/* DETAILS */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.detailsTitle}>Details</Text>

                    <View style={styles.card}>

                        {/* Student */}
                        <View style={styles.row}>
                            <MaterialIcons name="badge" size={28} color="#9B7FD4" />
                            <View style={styles.textBlock}>
                                <Text style={styles.label}>Student ID:</Text>
                                <Text style={styles.value}>2023045033</Text>

                                <Text style={styles.label}>Name:</Text>
                                <Text style={styles.value}>Linda Walker</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Document */}
                        <View style={styles.row}>
                            <MaterialIcons name="description" size={28} color="#9B7FD4" />
                            <View style={styles.textBlock}>
                                <Text style={styles.label}>Document Type:</Text>
                                <Text style={styles.value}>Medical Certificate</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Date */}
                        <View style={styles.row}>
                            <MaterialIcons name="calendar-today" size={28} color="#9B7FD4" />
                            <View style={styles.textBlock}>
                                <Text style={styles.label}>Date:</Text>
                                <Text style={styles.value}>March 18, 2026</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Office */}
                        <View style={styles.row}>
                            <MaterialIcons name="location-on" size={28} color="#9B7FD4" />
                            <View style={styles.textBlock}>
                                <Text style={styles.label}>Office:</Text>
                                <Text style={styles.value}>Registrar</Text>
                            </View>
                        </View>

                    </View>
                </View>
                
                <View style={[styles.footer, { backgroundColor: colors.background }]}>
                    <View style={styles.footerRow}>

                        <TouchableOpacity
                            style={[styles.backBtn, { backgroundColor: "#9B7FD4" }]}
                            onPress={() => router.replace("/Userdashboard")}
                        >
                            <Text style={styles.backBtnText}>Back to Home</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.secondaryBtn, { borderColor: "#9B7FD4" }]}
                            onPress={() => router.push("/active-req")} 
                        >
                            <Text style={[styles.secondaryBtnText, { color: "#9B7FD4" }]}>
                                View Request
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        paddingBottom: 140,
    },

    topSection: {
        alignItems: "center",
        marginTop: 30,
    },

    ref: {
        fontSize: 18,
        fontWeight: "500",
        color: "#333",
        marginTop: 10,
    },

    refNum: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#000",
        letterSpacing: 4,
    },

    qrContainer: {
        marginTop: 20,
        alignItems: "center",
    },

    qrBox: {
        width: 160,
        height: 160,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#9B7FD4",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F6FF",
    },

    qrText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#9B7FD4",
        letterSpacing: 2,
    },

    qrLabel: {
        marginTop: 8,
        fontSize: 12,
        color: "#666",
    },

    detailsContainer: {
        width: "100%",
        paddingHorizontal: 20,
        marginTop: 10,
    },

    detailsTitle: {
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 10,
        color: "#000",
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 10,
    },

    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    textBlock: {
        marginLeft: 12,
        flex: 1,
    },

    label: {
        fontSize: 13,
        color: "#666",
    },

    value: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 4,
    },

    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 8,
    },

    smallCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
    },

    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    backBtn: {
        width: "40%",
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: 'center'
    },

    backBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700'
    },

    secondaryBtn: {
        borderWidth: 2,
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 15,
        alignItems: "center",
        backgroundColor: "transparent",
    },

    secondaryBtnText: {
        fontSize: 15,
        fontWeight: "700",
    },

});