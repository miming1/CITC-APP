import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal, Pressable, ScrollView, StyleSheet, Text,
  TouchableOpacity, View, useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { Colors } from "../constants/theme";
import { fetchProcedures } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Procedure {
  id: number;
  procedure_name: string;
  description: string;
}

interface Office {
  id: string;
  name: string;
  address: string;
  processes: string[];
}

// ─── Offices stay hardcoded (not in backend yet) ──────────────────────────────

const OFFICES: Office[] = [
  {
    id: "1", name: "Dean's Office",
    address: "2nd Floor, Admin Building, USTP CDO",
    processes: ["Grade Appeal", "Leave of Absence"],
  },
  {
    id: "2", name: "Faculty Office",
    address: "3rd Floor, College Building, USTP CDO",
    processes: ["Medical Certificate Submission", "INC Form"],
  },
  {
    id: "3", name: "TCM Office",
    address: "1st Floor, TCM Building, USTP CDO",
    processes: ["Enrollment Assistance"],
  },
  {
    id: "4", name: "Data Science Office",
    address: "2nd Floor, IT Building, USTP CDO",
    processes: ["Special Exam", "Petition for Completion"],
  },
  {
    id: "5", name: "Computer Science Office",
    address: "3rd Floor, IT Building, USTP CDO",
    processes: ["Grade Appeal", "Special Exam"],
  },
  {
    id: "6", name: "IT Office",
    address: "Ground Floor, IT Building, USTP CDO",
    processes: ["Enrollment Assistance", "INC Form"],
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProcessListScreen() {

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme as "light" | "dark"];

  const bg      = colors.background;
  const textPri = isDark ? '#ECEDEE' : '#1E1340';
  const textSec = isDark ? '#9BA1A6' : '#6B6485';
  const border  = colors.icon;

  const { username } = useLocalSearchParams<{ username: string }>();

  // ── State ─────────────────────────────────────────────────────────────────
  const [search, setSearch]                 = useState("");
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [procedures, setProcedures]         = useState<Procedure[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // ── Fetch procedures from backend ─────────────────────────────────────────
  useEffect(() => {
    async function loadProcedures() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProcedures();
        setProcedures(data);
      } catch (e) {
        setError("Could not load procedures. Check your connection.");
      } finally {
        setLoading(false);
      }
    }
    loadProcedures();
  }, []);

  // ── Filter by search ──────────────────────────────────────────────────────
  const filtered = procedures.filter((p) =>
    p.procedure_name.toLowerCase().includes(search.toLowerCase())
  );

  function goToProcess() { router.push("/process"); }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>

      <Header title="Processes" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <SearchBar
          placeholder="Search processes…"
          onChangeText={setSearch}
        />

        {/* ── Processes Section ── */}
        <Text style={[s.sectionTitle, { color: textPri }]}>Processes</Text>

        <View>
          {loading && (
            <View style={s.centered}>
              <ActivityIndicator size="large" color={Colors.light.tint} />
              <Text style={[s.loadingText, { color: textSec }]}>Loading procedures…</Text>
            </View>
          )}

          {!loading && error && (
            <View style={s.centered}>
              <MaterialIcons name="wifi-off" size={40} color={textSec} />
              <Text style={[s.errorText, { color: textSec }]}>{error}</Text>
              <TouchableOpacity
                style={[s.retryBtn, { borderColor: Colors.light.tint }]}
                onPress={() => {
                  setLoading(true);
                  fetchProcedures()
                    .then((data) => { setProcedures(data); setError(null); })
                    .catch(() => setError("Could not load procedures. Check your connection."))
                    .finally(() => setLoading(false));
                }}
              >
                <Text style={[s.retryText, { color: Colors.light.tint }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[s.card, { backgroundColor: bg, borderColor: border }]}
              onPress={goToProcess}
              activeOpacity={0.75}
            >
              <View style={s.cardLeft}>
                <View style={s.cardIcon}>
                  <MaterialIcons name="description" size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, { color: textPri }]}>
                    {item.procedure_name}
                  </Text>
                  <Text style={[s.cardDesc, { color: textSec }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={textSec} />
            </TouchableOpacity>
          ))}

          {!loading && !error && filtered.length === 0 && procedures.length > 0 && (
            <Text style={[s.empty, { color: textSec }]}>No procedures match your search.</Text>
          )}
        </View>

        {/* ── Offices Section ── */}
        <Text style={[s.sectionTitle, { color: textPri }]}>Offices</Text>

        <View style={s.grid}>
          {OFFICES.map((office) => (
            <TouchableOpacity
              key={office.id}
              style={s.officeItem}
              activeOpacity={0.75}
              onPress={() => setSelectedOffice(office)}
            >
              <View style={[s.officeBox, { backgroundColor: bg, borderColor: border }]}>
                <MaterialIcons name="business" size={28} color={Colors.light.tint} />
              </View>
              <Text style={[s.officeName, { color: textPri }]} numberOfLines={2}>
                {office.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Floating Buttons ── */}
      <View style={s.fab}>
        <TouchableOpacity style={s.fabBtn}>
          <MaterialIcons name="chat" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={s.fabBtn}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Office Info Modal ── */}
      <Modal
        visible={!!selectedOffice}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedOffice(null)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setSelectedOffice(null)}>
          <Pressable style={[s.modalCard, { backgroundColor: isDark ? '#1E1E2E' : '#EDE8F7' }]}>

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

          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 160 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, marginTop: 4 },

  // ── Loading / Error ────────────────────────────────────────────────────────
  centered: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  loadingText: { fontSize: 13, marginTop: 8 },
  errorText:   { fontSize: 13, textAlign: "center", marginTop: 8 },
  retryBtn: {
    marginTop: 6,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  retryText: { fontSize: 13, fontWeight: "600" },

  // ── Procedure Card ─────────────────────────────────────────────────────────
  card: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1, borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  cardLeft:  { flexDirection: "row", alignItems: "center", flex: 1 },
  cardIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.light.tint,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: "600" },
  cardDesc:  { fontSize: 11, marginTop: 2 },
  empty:     { textAlign: "center", marginTop: 20, fontSize: 13 },

  // ── Offices ────────────────────────────────────────────────────────────────
  grid:       { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  officeItem: { width: "30%", alignItems: "center" },
  officeBox: {
    width: 72, height: 72, borderRadius: 16, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  officeName: { fontSize: 10, textAlign: "center", lineHeight: 13 },

  // ── FAB ────────────────────────────────────────────────────────────────────
  fab: { position: "absolute", right: 20, bottom: 36, gap: 14 },
  fabBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.light.tint,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },

  // ── Office Modal ───────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 20, padding: 24, width: '100%',
    elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12,
  },
  closeBtn:    { position: 'absolute', top: 16, right: 20, zIndex: 1 },
  closeText:   { fontSize: 18, fontWeight: '400' },
  modalRow:    { flexDirection: 'row', marginBottom: 16, paddingRight: 24 },
  modalLabel:  { fontSize: 14, fontWeight: '700', width: 90, marginRight: 8, paddingTop: 1 },
  modalValue:  { flex: 1, fontSize: 14, lineHeight: 20 },
  modalBullet: { fontSize: 14, lineHeight: 22 },
});