import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FAQCard from "../components/FAQCard";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    id: "1",
    question: "Where do I submit my medical certificate?",
    answer: "Submit your medical certificate to the faculty office or through the designated submission portal on the HIMS.",
  },
  {
    id: "2",
    question: "How do I file a leave of absence?",
    answer: "Submit a Leave of Absence form to the Dean's Office. Attach required documents and get approval before your leave starts.",
  },
  {
    id: "3",
    question: "How do I file a grade appeal?",
    answer: "Submit a grade appeal form to the Dean's Office within 2 weeks after grades are released. Include supporting documents.",
  },
  {
    id: "4",
    question: "What is an INC grade and how do I clear it?",
    answer: "An INC (Incomplete) means you have an outstanding requirement. Complete it within the deadline set by your professor.",
  },
  {
    id: "5",
    question: "How do I request a special exam?",
    answer: "Submit a special exam request form to your department head with a valid reason and supporting documents.",
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FAQScreen() {

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  // Same color pattern 
  const bg      = isDark ? "#151718" : "#fff";
  const textPri = isDark ? "#ECEDEE" : "#1E1340";

  // Search state — filters FAQ cards as user types
  const [search, setSearch] = useState("");

  // Filter FAQ items based on search input
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return FAQ_ITEMS; // show all when search is empty
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: bg }]}>

      {/* Reused Header */}
      <Header title="FAQs" />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Reused SearchBar */}
        <SearchBar
          placeholder="Search..."
          onChangeText={setSearch}
        />

        {/* Section title */}
        <Text style={[s.sectionTitle, { color: textPri }]}>
          Frequently Asked Questions
        </Text>

        {/* FAQ Cards */}
        <View style={s.cardList}>
          {filtered.map((item) => (
            <FAQCard
              key={item.id}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </View>

        {/* No results */}
        {filtered.length === 0 && (
          <Text style={[s.empty, { color: isDark ? "#9BA1A6" : "#6B6485" }]}>
            No FAQs found.
          </Text>
        )}

      </ScrollView>

      {/* Reused FloatingButtons*/}
      <FloatingButtons activeTab="faq" />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { paddingBottom: 160 },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 16,
  },

  cardList: { paddingHorizontal: 16 },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
});