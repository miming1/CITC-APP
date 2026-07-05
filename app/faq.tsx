import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: number;
}

export default function FAQScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#151718" : "#fff";
  const textPri = isDark ? "#ECEDEE" : "#1E1340";

  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [search, setSearch] = useState("");
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // FETCH FAQS (FIXED)
  // =========================
  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchFAQs(categoryId ?? undefined);

      // safety check (prevents crash if API returns object)
      if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        setFaqs([]);
      }

    } catch (err) {
      console.log("FAQ load error:", err);
      setError("Could not load FAQs. Check your connection.");
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ON MOUNT + WHEN SCREEN FOCUSED
  // =========================
  useFocusEffect(
    useCallback(() => {
      loadFAQs();
    }, [categoryId])
  );

  // =========================
  // SEARCH FILTER
  // =========================
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return faqs;

    return faqs.filter(
      (item) =>
        item.question?.toLowerCase().includes(q) ||
        item.answer?.toLowerCase().includes(q)
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

        {/* LIST */}
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

        {/* EMPTY */}
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