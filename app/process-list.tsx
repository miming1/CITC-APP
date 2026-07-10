import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Image, Modal, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, useColorScheme, useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AddProcessModal from "../components/AddProcessModal";
import AssignedProcedures from "../components/AssignedProcedures";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { Colors } from "../constants/theme";
import { fetchProcedures } from "../lib/api";

interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description?: string;
}

interface Office {
  id: string;
  name: string;
  address: string;
  processes: string[];
  logo: any; 
}

// ─── Hardcoded offices ────────────────
const OFFICES: Office[] = [
  {
    id: "1",
    name: "Dean's Office",
    address: "1st Floor, Admin Building, USTP CDO",
    processes: ["Grade Appeal", "Leave of Absence"],
    logo: require("../assets/images/offices/citc.png"),
  },
  {
    id: "2",
    name: "Faculty Office",
    address: "4th Floor, College Building, USTP CDO",
    processes: ["Medical Certificate Submission", "INC Form"],
    logo: require("../assets/images/offices/citc.png"),
  },
  {
    id: "3",
    name: "TCM Office",
    address: "2nd Floor, TCM Building, USTP CDO",
    processes: ["Enrollment Assistance"],
    logo: require("../assets/images/offices/tcm.png"),
  },
  {
    id: "4",
    name: "Data Science Office",
    address: "2nd Floor, IT Building, USTP CDO",
    processes: ["Special Exam", "Petition for Completion"],
    logo: require("../assets/images/offices/ds.png"),
  },
  {
    id: "5",
    name: "Computer Science Office",
    address: "3rd Floor, IT Building, USTP CDO",
    processes: ["Grade Appeal", "Special Exam"],
    logo: require("../assets/images/offices/cs.png"),
  },
  {
    id: "6",
    name: "IT Office",
    address: "4th Floor, IT Building, USTP CDO",
    processes: ["Enrollment Assistance", "INC Form"],
    logo: require("../assets/images/offices/it.png"),
  },
];

export default function ProcessListScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme as "light" | "dark"];

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const bg = colors.background;
  const textPri = isDark ? "#ECEDEE" : "#1E1340";
  const textSec = isDark ? "#9BA1A6" : "#6B6485";
  const border = colors.icon;

  const {
    roleId,
    admin_mode,
    message: routeMessage,
  } = useLocalSearchParams();

  const isAdmin =
    Number(roleId) === 2 || admin_mode === "true";

  const [search, setSearch] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProcessModal, setShowAddProcessModal] = useState(false);
  const [message, setMessage] = useState("");

  const loadProcedures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProcedures();
      if (!Array.isArray(data)) throw new Error("Invalid API response");
      setProcedures(data);
    } catch (e) {
      console.error("Procedure load error:", e);
      setError("Could not load procedures. Check your connection.");
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProcedures(); }, []);
  useFocusEffect(useCallback(() => { loadProcedures(); }, []));

  const filtered = procedures.filter((p) =>
    p.procedure_name.toLowerCase().includes(search.toLowerCase())
  );

  function goToProcess(item: Procedure) {
    router.push({
      pathname: "/process",
      params: { id: item.procedure_id, roleId: isAdmin ? 2 : 1 },
    });
  }

  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  useEffect(() => {
    if (routeMessage) {
      showMessage(String(routeMessage));
    }
  }, [routeMessage]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      <Header
        title="Procedures"
        roleId={roleId as string}
        adminMode={admin_mode as string}
      />
      {message !== "" && (
        <View
          style={[
            s.toast,
            {
              backgroundColor: isDark
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
              s.toastText,
              {
                color: isDark
                  ? "#FFFFFF"
                  : "#166534",
              },
            ]}
          >
            {message}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={true}>
        <View style={[s.container, isDesktop && s.desktopContainer]}>
          <SearchBar placeholder="Search processes…" onChangeText={setSearch} />

          <Text style={[s.sectionTitle, { color: textPri }]}>Processes</Text>

          {loading && (
            <View style={s.centered}>
              <ActivityIndicator size="large" color={Colors.light.tint} />
              <Text style={{ color: textSec }}>Loading procedures…</Text>
            </View>
          )}

          {!loading && error && (
            <View style={s.centered}>
              <Text style={{ color: textSec }}>{error}</Text>
              <TouchableOpacity onPress={loadProcedures} style={s.retryBtn}>
                <Text style={{ color: Colors.light.tint }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && (
            <AssignedProcedures
              procedures={filtered}
              limit={filtered.length}
              showSeeAll={false}
              onPressProcedure={goToProcess}
            />
          )}

          <Text style={[s.sectionTitle, { color: textPri }]}>Offices</Text>

          <View style={s.grid}>

                        {OFFICES.map((office) => (
              <View key={office.id} style={s.officeItem}>
                <TouchableOpacity
                  style={s.officeTouchable}
                  activeOpacity={0.75}
                  onPress={() => setSelectedOffice(office)}
                >
                  <View style={[s.officeBox, { backgroundColor: "#ffffff", borderColor: border }]}>
                    {office.logo ? (
                      <Image
                        source={office.logo}
                        style={s.officeLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <MaterialIcons name="business" size={28} color={Colors.light.tint} />
                    )}
                  </View>
                  <Text style={[s.officeName, { color: textPri }]} numberOfLines={2}>
                    {office.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {isAdmin ? (
        <FloatingButtons
          isAdmin
          adminIcon="add"
          adminTooltip="Add Process"
          onAdminPress={() => setShowAddProcessModal(true)}
        />
      ) : (
        <FloatingButtons activeTab="faq" />
      )}

      {/* ── Office Info Modal ── */}
      <Modal
        visible={!!selectedOffice}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedOffice(null)}
      >
        <View style={s.modalOverlay}>

          <View
            style={[s.modalCard, { backgroundColor: isDark ? "#141a73" : "#ffffff" }]}
          >
            <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedOffice(null)}>
              <Text style={[s.closeText, { color: textSec }]}>✕</Text>
            </TouchableOpacity>

            <View style={s.modalRow}>
              <Text style={[s.modalLabel, { color: textPri }]}>Office Name:</Text>
              <Text style={[s.modalValue, { color: textPri }]}>{selectedOffice?.name}</Text>
            </View>

            <View style={s.modalRow}>
              <Text style={[s.modalLabel, { color: textPri }]}>Address:</Text>
              <Text style={[s.modalValue, { color: textPri }]}>{selectedOffice?.address}</Text>
            </View>

            <View style={s.modalRow}>
              <Text style={[s.modalLabel, { color: textPri }]}>Processes:</Text>
              <View style={{ flex: 1 }}>
                {selectedOffice?.processes.map((p, i) => (
                  <Text key={i} style={[s.modalBullet, { color: textPri }]}>• {p}</Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {isAdmin && (
        <AddProcessModal
          visible={showAddProcessModal}
          onClose={() => setShowAddProcessModal(false)}
          onCreated={() => {
            loadProcedures();
            showMessage("Procedure added successfully.");
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 160 },

  container: { width: "100%", marginTop: 20 },
  desktopContainer: { width: "95%", maxWidth: 1600, alignSelf: "center" },

  sectionTitle: { fontSize: 20, fontWeight: "700", marginTop: 20 },
  centered: { alignItems: "center", paddingVertical: 32, gap: 10 },
  retryBtn: { marginTop: 10, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardLeft: { flexDirection: "row", flex: 1, alignItems: "center" },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.light.tint, alignItems: "center", justifyContent: "center", marginRight: 12 },
  cardTitle: { fontSize: 13, fontWeight: "600" },
  cardDesc: { fontSize: 11, marginTop: 2 },
  empty: { textAlign: "center", marginTop: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "flex-start" },
  officeItem: { width: "30%", alignItems: "center", alignSelf: "flex-start", marginTop: 20  },
  officeTouchable: { alignItems: "center", alignSelf: "center" },
  officeBox: { width: 72, height: 72, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 6,},
  officeLogo: {width: 50,height: 50,},
  officeName: { fontSize: 12, textAlign: "center", lineHeight: 13, marginTop: 10  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: { borderRadius: 24, padding: 24, width: "100%", maxWidth: 520, elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20 },
  closeBtn: { position: "absolute", top: 16, right: 20, zIndex: 1 },
  closeText: { fontSize: 18, fontWeight: "400" },
  modalRow: { flexDirection: "row", marginBottom: 16, paddingRight: 24 },
  modalLabel: { fontSize: 14, fontWeight: "700", width: 90, marginRight: 8, paddingTop: 1 },
  modalValue: { flex: 1, fontSize: 14, lineHeight: 20 },
  modalBullet: { fontSize: 14, lineHeight: 22 },
  fab: { position: "absolute", right: 24, bottom: 40, width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5 },
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
});