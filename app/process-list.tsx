import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { Colors } from "../constants/theme";
import { fetchProcedures } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────
interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description: string;
}

interface Office {
  id: string;
  name: string;
  address: string;
  processes: string[];
}

// ─── Static Offices ───────────────────────────────────────────────────────
const OFFICES: Office[] = [
  {
    id: "1",
    name: "Dean's Office",
    address: "2nd Floor, Admin Building, USTP CDO",
    processes: ["Grade Appeal", "Leave of Absence"],
  },
  {
    id: "2",
    name: "Faculty Office",
    address: "3rd Floor, College Building, USTP CDO",
    processes: ["Medical Certificate Submission", "INC Form"],
  },
  {
    id: "3",
    name: "TCM Office",
    address: "1st Floor, TCM Building, USTP CDO",
    processes: ["Enrollment Assistance"],
  },
  {
    id: "4",
    name: "Data Science Office",
    address: "2nd Floor, IT Building, USTP CDO",
    processes: ["Special Exam", "Petition for Completion"],
  },
  {
    id: "5",
    name: "Computer Science Office",
    address: "3rd Floor, IT Building, USTP CDO",
    processes: ["Grade Appeal", "Special Exam"],
  },
  {
    id: "6",
    name: "IT Office",
    address: "Ground Floor, IT Building, USTP CDO",
    processes: ["Enrollment Assistance", "INC Form"],
  },
];

// ─── Screen ────────────────────────────────────────────────────────────────
export default function ProcessListScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme as "light" | "dark"];

  const bg = colors.background;
  const textPri = isDark ? "#ECEDEE" : "#1E1340";
  const textSec = isDark ? "#6B6485" : "#6B6485";
  const border = colors.icon;

  const { username } = useLocalSearchParams();

  // ── State ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ────────────────────────────────────────────────────────────────────────
  // FETCH FUNCTION (FIXED)
  // ────────────────────────────────────────────────────────────────────────
  const loadProcedures = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchProcedures();

      // IMPORTANT: ensure it's always an array
      if (!Array.isArray(data)) {
        throw new Error("Invalid API response (not array)");
      }

      setProcedures(data);
    } catch (e) {
      console.error("Procedure load error:", e);
      setError("Could not load procedures. Check your connection.");
      setProcedures([]); // prevent stale UI bugs
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // INITIAL LOAD
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadProcedures();
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // REFRESH WHEN SCREEN IS FOCUSED (IMPORTANT FIX)
  // ────────────────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadProcedures();
    }, [])
  );

  // ────────────────────────────────────────────────────────────────────────
  // FILTER
  // ────────────────────────────────────────────────────────────────────────
  const filtered = procedures.filter((p) =>
    p.procedure_name.toLowerCase().includes(search.toLowerCase())
  );

  // ────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ────────────────────────────────────────────────────────────────────────
  function goToProcess(item: Procedure) {
    router.push({
      pathname: "/process",
      params: {
        id: item.procedure_id,
        roleId: 1,
      },
    });
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>
      <Header title="Processes" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SearchBar placeholder="Search processes…" onChangeText={setSearch} />

        <Text style={[s.sectionTitle, { color: textPri }]}>Processes</Text>

        {/* LOADING */}
        {loading && (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
            <Text style={{ color: textSec }}>Loading procedures…</Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error && (
          <View style={s.centered}>
            <Text style={{ color: textSec }}>{error}</Text>
            <TouchableOpacity onPress={loadProcedures} style={s.retryBtn}>
              <Text style={{ color: Colors.light.tint }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LIST */}
        {!loading &&
          !error &&
          filtered.map((item) => (
            <TouchableOpacity
              key={item.procedure_id}
              style={[s.card, { backgroundColor: bg, borderColor: border }]}
              onPress={() => goToProcess(item)}
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

        {!loading && !error && filtered.length === 0 && (
          <Text style={[s.empty, { color: textSec }]}>
            No procedures found.
          </Text>
        )}

        {/* OFFICES (STATIC) */}
        <Text style={[s.sectionTitle, { color: textPri }]}>Offices</Text>

        <View style={s.grid}>
          {OFFICES.map((office) => (
            <TouchableOpacity
              key={office.id}
              style={s.officeItem}
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

      {/* MODAL */}
      <Modal visible={!!selectedOffice} transparent animationType="fade">
        <Pressable style={s.modalOverlay} onPress={() => setSelectedOffice(null)}>
          <Pressable style={[s.modalCard, { backgroundColor: isDark ? "#1E1E2E" : "#fff" }]}>
            <Text style={{ color: textPri, fontWeight: "700" }}>
              {selectedOffice?.name}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 160 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

  centered: { alignItems: "center", paddingVertical: 32, gap: 10 },

  retryBtn: {
    marginTop: 10,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  cardLeft: { flexDirection: "row", flex: 1, alignItems: "center" },

  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardTitle: { fontSize: 13, fontWeight: "600" },
  cardDesc: { fontSize: 11, marginTop: 2 },

  empty: { textAlign: "center", marginTop: 20 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },

  officeItem: { width: "30%", alignItems: "center" },

  officeBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },

  officeName: { fontSize: 10, textAlign: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    padding: 20,
    borderRadius: 16,
    width: "90%",
  },
});