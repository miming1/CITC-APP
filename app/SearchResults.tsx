import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FAQCard from '../components/FAQCard';
import FloatingButtons from '../components/FloatingButtons';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Process {
  id: string;
  title: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POPULAR_PROCESSES: Process[] = [
  { id: '1', title: 'Special Exam' },
  { id: '2', title: 'Petition for C..' },
  { id: '3', title: 'Leave of Absence' },
  { id: '4', title: 'INC' },
  { id: '5', title: 'Medical Certificate Sub..' },
  { id: '6', title: 'Process 6' },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'Where do I submit my medical certificate?',
    answer: 'Submit it to the faculty office.',
  },
  {
    id: '2',
    question: 'Is there a payment for the medical certificate?',
    answer: 'There is no payment when getting a medical certificate.',
  },
  {
    id: '3',
    question: 'How do I get a medical certificate',
    answer: 'Visit the health center.',
  },
  {
    id: '4',
    question: 'What are the accepted health issues for issuing a medical certificate?',
    answer: 'Consult the University Health Services for a full list of accepted conditions.',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SearchResults() {

  const { query } = useLocalSearchParams<{ query: string }>();
  const [search, setSearch] = useState(query ?? '');

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Reusable Header */}
      <Header title="Search Results" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Reusable SearchBar — re-searches on submit */}
        <SearchBar
          placeholder="Search..."
          onSearch={(newQuery) => {
            router.push({
              pathname: '/SearchResults',
              params: { query: newQuery },
            });
          }}
          onChangeText={setSearch}
        />

        {/* ── Results Label ── */}
        <Text style={styles.resultsLabel}>
          Results for: <Text style={styles.resultsQuery}>"{search}"</Text>
        </Text>

        {/* ── Popular Processes — pill style ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Processes</Text>
          <View style={styles.grid}>
            {POPULAR_PROCESSES.map((item) => (
              <Text key={item.id} style={styles.pill} numberOfLines={1}>
                {item.title}
              </Text>
            ))}
          </View>
        </View>

        {/* ── FAQs ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {FAQ_ITEMS.map((item) => (
            <FAQCard key={item.id} question={item.question} answer={item.answer} />
          ))}
        </View>

      </ScrollView>

      {/* Floating Buttons */}
      <FloatingButtons activeTab="faq" />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── SafeArea ───────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 160,
    paddingTop: 8,
  },

  // ── Results Label ──────────────────────────────────────────────────────────
  resultsLabel: { fontSize: 13, color: '#6B6485', marginBottom: 20, paddingHorizontal: 4 },
  resultsQuery: { color: '#9B7FD4', fontStyle: 'italic', fontWeight: '600' },

  // ── Sections ───────────────────────────────────────────────────────────────
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1340',
    marginBottom: 16,
  },

  // ── Popular Processes pill grid ────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    height: 30,
    maxWidth: 166,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#EBEBEB',
    fontSize: 12,
    color: '#1E1340',
    fontWeight: '500',
    overflow: 'hidden',
    textAlignVertical: 'center',
    lineHeight: 30,
  },

});