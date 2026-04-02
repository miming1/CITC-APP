import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View, useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { Colors } from "../constants/theme";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROCESSES = [
  { id: "1", title: "Medical Certificate Submission", duration: "1–3 Days" },
  { id: "2", title: "Leave of Absence Request",       duration: "3–5 Days" },
  { id: "3", title: "Enrollment Assistance",          duration: "1 Day"    },
  { id: "4", title: "Scholarship Application",        duration: "5–7 Days" },
  { id: "5", title: "Grade Appeal",                   duration: "3–5 Days" },
];

const OFFICES = [
  "Dean's Office",
  "Faculty Office",
  "TCM Office",
  "Data Science Office",
  "Computer Science Office",
  "IT Office",
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProcessListScreen() {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme as "light" | "dark"];

  const { username } = useLocalSearchParams<{ username: string }>();

  const [search, setSearch] = useState("");

  const filtered = PROCESSES.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  function goToProcess() {
    router.push("/process");
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.background }]}>

      {/* Reusable Header — showBack defaults to true */}
      <Header title="Processes" />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar ── */}
        <View style={s.searchRow}>
          <MaterialIcons name="search" size={20} color="#aaa" style={{ marginRight: 8 }} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search processes…"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Processes Section ── */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Processes</Text>

        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.card, { backgroundColor: colors.background, borderColor: colors.icon }]}
            onPress={goToProcess}
            activeOpacity={0.75}
          >
            <View style={s.cardLeft}>
              <View style={s.cardIcon}>
                <MaterialIcons name="description" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={s.cardDuration}>⏱ {item.duration}</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#aaa" />
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <Text style={s.empty}>No processes found.</Text>
        )}

        {/* ── Offices Section ── */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Offices</Text>

        <View style={s.grid}>
          {OFFICES.map((name, i) => (
            <TouchableOpacity key={i} style={s.officeItem} activeOpacity={0.75}>
              <View style={[s.officeBox, { backgroundColor: colors.background, borderColor: colors.icon }]}>
                <MaterialIcons name="business" size={28} color={Colors.light.tint} />
              </View>
              <Text style={[s.officeName, { color: colors.text }]} numberOfLines={2}>
                {name}
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

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1 },
  // paddingBottom: 160 ensures content clears the floating buttons
  scroll: { paddingHorizontal: 16, paddingBottom: 160 },

  searchRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f0f0f0", borderRadius: 12,
    paddingHorizontal: 12, marginTop: 16, marginBottom: 20,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, marginTop: 4 },

  card: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1, borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  cardLeft:     { flexDirection: "row", alignItems: "center", flex: 1 },
  cardIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.light.tint,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  cardTitle:    { fontSize: 13, fontWeight: "600" },
  cardDuration: { fontSize: 11, color: "#888", marginTop: 2 },
  empty:        { textAlign: "center", color: "#aaa", marginTop: 20, fontSize: 13 },

  grid:       { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  officeItem: { width: "30%", alignItems: "center" },
  officeBox: {
    width: 72, height: 72, borderRadius: 16, borderWidth: 1,
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  officeName: { fontSize: 10, textAlign: "center", lineHeight: 13 },

  fab: { position: "absolute", right: 20, bottom: 36, gap: 14 },
  fabBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.light.tint,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
});