import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FAQCard from '../components/FAQCard';
import FloatingButtons from '../components/FloatingButtons';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Process { id: string; title: string; }
interface FAQItem  { id: string; question: string; answer: string; }
interface Office   { id: string; name: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_PROCESSES: Process[] = [
  { id: '1', title: 'Special Exam' },
  { id: '2', title: 'Petition for Completion' },
  { id: '3', title: 'Leave of Absence' },
  { id: '4', title: 'INC' },
  { id: '5', title: 'Medical Certificate Submission' },
  { id: '6', title: 'Grade Appeal' },
];

const ALL_FAQS: FAQItem[] = [
  { id: '1', question: 'Where do I submit my medical certificate?',          answer: 'Submit it to the faculty office.' },
  { id: '2', question: 'Is there a payment for the medical certificate?',    answer: 'There is no payment when getting a medical certificate.' },
  { id: '3', question: 'How do I get a medical certificate?',                answer: 'Visit the health center.' },
  { id: '4', question: 'What are the accepted health issues for issuing a medical certificate?', answer: 'Consult the University Health Services for a full list of accepted conditions.' },
];

const ALL_OFFICES: Office[] = [
  { id: '1', name: "Dean's Office" },
  { id: '2', name: 'Faculty Office' },
  { id: '3', name: 'TCM Office' },
  { id: '4', name: 'Data Science Office' },
  { id: '5', name: 'Computer Science Office' },
  { id: '6', name: 'IT Office' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchResults() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [search, setSearch] = useState(query ?? '');

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const bg      = isDark ? '#151718' : '#fff';
  const textPri = isDark ? '#ECEDEE' : '#1E1340';
  const textSec = isDark ? '#9BA1A6' : '#6B6485';
  const accent  = '#9B7FD4';

  // ── Filter all data sources by search query ────────────────────────────────
  const q = search.toLowerCase();

  const matchedProcesses = useMemo(() =>
    ALL_PROCESSES.filter((p) => p.title.toLowerCase().includes(q)), [q]);

  const matchedFAQs = useMemo(() =>
    ALL_FAQS.filter((f) =>
      f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    ), [q]);

  const matchedOffices = useMemo(() =>
    ALL_OFFICES.filter((o) => o.name.toLowerCase().includes(q)), [q]);

  const hasResults = matchedProcesses.length > 0 || matchedFAQs.length > 0 || matchedOffices.length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>

      <Header title="Search Results" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Reusable SearchBar — marginHorizontal:16 already built in, aligns with header */}
        <SearchBar
          placeholder="Search..."
          onSearch={(newQuery) => {
            setSearch(newQuery);
            router.setParams({ query: newQuery });
          }}
          onChangeText={(text) => setSearch(text)}
        />

        {/* Results label */}
        <Text style={[styles.resultsLabel, { color: textSec }]}>
          Results for: <Text style={[styles.resultsQuery, { color: accent }]}>"{search}"</Text>
        </Text>

        {!hasResults && search.length > 0 && (
          <Text style={[styles.empty, { color: textSec }]}>No results found.</Text>
        )}

        {/* ── Matched Processes ── */}
        {matchedProcesses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPri }]}>Popular Processes</Text>
            <View style={styles.pillGrid}>
              {matchedProcesses.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.pill, { backgroundColor: isDark ? '#2A2040' : '#EBEBEB' }]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, { color: textPri }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Matched Offices ── */}
        {matchedOffices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPri }]}>Offices</Text>
            <View style={styles.pillGrid}>
              {matchedOffices.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.pill, { backgroundColor: isDark ? '#2A2040' : '#EBEBEB' }]}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, { color: textPri }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Matched FAQs ── */}
        {matchedFAQs.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPri }]}>FAQs</Text>
            {matchedFAQs.map((item) => (
              <FAQCard key={item.id} question={item.question} answer={item.answer} />
            ))}
          </View>
        )}

      </ScrollView>

      <FloatingButtons activeTab="faq" onTrackPress={() => {}} onFAQPress={() => {}} />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: { flex: 1 },

  // paddingHorizontal: 0 — searchbar has its own marginHorizontal:16 matching header
  scroll: {
    paddingBottom: 160,
    paddingTop: 0,
  },

  resultsLabel:  { fontSize: 13, marginBottom: 20, paddingHorizontal: 20 },
  resultsQuery:  { fontStyle: 'italic', fontWeight: '600' },
  empty:         { textAlign: 'center', marginTop: 40, fontSize: 14 },

  section:       { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle:  { fontSize: 17, fontWeight: '700', marginBottom: 12 },

  pillGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    height: 30,
    maxWidth: 166,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText:      { fontSize: 12, fontWeight: '500' },

});