import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FAQCard from "../components/FAQCard";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

import { fetchFAQs, fetchProcedures } from "../lib/api";

// ─── Types ────────────────────────────────────────────────

interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description?: string;
}

interface FAQItem {
  faq_id: number;
  question: string;
  answer: string;
}

// ─── Screen ────────────────────────────────────────────────

export default function SearchResults() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [search, setSearch] = useState(query ?? "");

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  const bg = isDark ? "#151718" : "#fff";
  const textPri = isDark ? "#ECEDEE" : "#1E1340";
  const textSec = isDark ? "#9BA1A6" : "#6B6485";
  const accent = "#9B7FD4";

  // ─── STATE FROM DB ────────────────────────────────
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── FETCH DATA ────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [procData, faqData] = await Promise.all([
          fetchProcedures(),
          fetchFAQs(), // no category filter = global search
        ]);

        setProcedures(procData);
        setFaqs(faqData);
      } catch (e) {
        setError("Failed to load search data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const q = search.toLowerCase();

  // ─── FILTER RESULTS ────────────────────────────────
  const matchedProcesses = useMemo(
    () =>
      procedures.filter((p) =>
        p.procedure_name.toLowerCase().includes(q)
      ),
    [q, procedures]
  );

  const matchedFAQs = useMemo(
    () =>
      faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      ),
    [q, faqs]
  );

  const hasResults =
    matchedProcesses.length > 0 || matchedFAQs.length > 0;

  // ─── LOADING ───────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
        <Header title="Search Results" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={{ color: textSec }}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── ERROR ────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
        <Header title="Search Results" />
        <View style={styles.centered}>
          <Text style={{ color: textSec }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <Header title="Search Results" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <SearchBar
          placeholder="Search..."
          onSearch={(newQuery) => {
            setSearch(newQuery);
            router.setParams({ query: newQuery });
          }}
          onChangeText={setSearch}
        />

        <Text style={[styles.resultsLabel, { color: textSec }]}>
          Results for:{" "}
          <Text style={[styles.resultsQuery, { color: accent }]}>
            "{search}"
          </Text>
        </Text>

        {!hasResults && search.length > 0 && (
          <Text style={[styles.empty, { color: textSec }]}>
            No results found.
          </Text>
        )}

        {/* ───────────── PROCEDURES ───────────── */}
        {matchedProcesses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPri }]}>
              Processes
            </Text>

            <View style={styles.pillGrid}>
              {matchedProcesses.map((item) => (
                <TouchableOpacity
                  key={item.procedure_id}
                  style={[
                    styles.pill,
                    { backgroundColor: isDark ? "#2A2040" : "#EBEBEB" },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/process",
                      params: {
                        id: item.procedure_id,
                        roleId: 1,
                      },
                    })
                  }
                >
                  <Text style={[styles.pillText, { color: textPri }]}>
                    {item.procedure_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ───────────── FAQS ───────────── */}
        {matchedFAQs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPri }]}>
              FAQs
            </Text>

            {matchedFAQs.map((item) => (
              <FAQCard
                key={item.faq_id}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingButtons activeTab="faq" onTrackPress={() => {}} onFAQPress={() => {}} />

    </SafeAreaView>
  );
}

// ─── STYLES ────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  scroll: {
    paddingBottom: 160,
  },

  resultsLabel: {
    fontSize: 13,
    marginBottom: 20,
    paddingHorizontal: 20,
  },

  resultsQuery: {
    fontStyle: "italic",
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },

  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },

  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  pillText: {
    fontSize: 12,
    fontWeight: "500",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
});