import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FAQCard from "../components/FAQCard";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { fetchFAQs } from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: number;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FAQScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#151718" : "#fff";
  const textPri = isDark ? "#ECEDEE" : "#1E1340";

  // ✅ get category from navigation params
  const { categoryId } = useLocalSearchParams();

  // ── State ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch FAQs ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadFAQs() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchFAQs(
          categoryId ? String(categoryId) : undefined
        );

        setFaqs(data);
      } catch (err) {
        setError("Could not load FAQs. Check your connection.");
      } finally {
        setLoading(false);
      }
    }

    loadFAQs();
  }, [categoryId]);

  // ── Filter by search ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    if (!q) return faqs;

    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [search, faqs]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <Header title="FAQs" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH */}
        <SearchBar
          placeholder="Search..."
          onChangeText={setSearch}
        />

        <Text style={[styles.sectionTitle, { color: textPri }]}>
          Frequently Asked Questions
        </Text>

        {/* LOADING */}
        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#9B7FD4" />
            <Text style={[styles.hint, { color: isDark ? "#9BA1A6" : "#6B6485" }]}>
              Loading FAQs…
            </Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error && (
          <Text style={[styles.hint, { color: isDark ? "#9BA1A6" : "#6B6485" }]}>
            {error}
          </Text>
        )}

        {/* FAQ LIST */}
        {!loading && !error && (
          <View style={styles.cardList}>
            {filtered.map((item) => (
              <FAQCard
                key={item.id}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filtered.length === 0 && (
          <Text style={[styles.hint, { color: isDark ? "#9BA1A6" : "#6B6485" }]}>
            No FAQs found.
          </Text>
        )}
      </ScrollView>

      <FloatingButtons
        activeTab="faq"
        onTrackPress={() => {}}
        onFAQPress={() => {}}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  scroll: {
    paddingBottom: 160,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 16,
  },

  cardList: {
    paddingHorizontal: 16,
  },

  centered: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },

  hint: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    paddingHorizontal: 16,
  },
});