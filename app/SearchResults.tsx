import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FAQCard from '../components/FAQCard';
import FloatingButtons from '../components/FloatingButtons';
import Header from '../components/Header';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Process {
  id: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POPULAR_PROCESSES: Process[] = [
  { id: '1' }, { id: '2' }, { id: '3' },
  { id: '4' }, { id: '5' }, { id: '6' },
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

  function handleSearch() {
    router.setParams({ query: search });
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Reusable Header — showBack defaults to true */}
      <Header title="Search Results" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar ── */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* ── Results Label ── */}
        <Text style={styles.resultsLabel}>
          Results for: <Text style={styles.resultsQuery}>"{search}"</Text>
        </Text>

        {/* ── Popular Processes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Processes</Text>
          <View style={styles.grid}>
            {POPULAR_PROCESSES.map((item) => (
              <View key={item.id} style={styles.card} />
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  // paddingBottom: 160 ensures the last FAQ card clears the floating buttons
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 160,
    paddingTop: 16,
  },

  // ── Search Bar ─────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE8F7',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E1340' },

  // ── Results Label ──────────────────────────────────────────────────────────
  resultsLabel: { fontSize: 13, color: '#6B6485', marginBottom: 20 },
  resultsQuery: { color: '#9B7FD4', fontStyle: 'italic', fontWeight: '600' },

  // ── Sections ───────────────────────────────────────────────────────────────
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1340',
    marginBottom: 16,
  },

  // ── Popular Processes Grid ─────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '31%',
    height: 70,
    backgroundColor: '#D8D3E8',
    borderRadius: 8,
  },

});