import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Colors } from "../constants/theme";

// ─── Components ───────────────────────────────────────────────────────────────
import FAQCard from '../components/FAQCard';
import FloatingButtons from '../components/FloatingButtons';
import Header from '../components/Header';
import PopularProcesses from '../components/PopularProcesses';
import SearchBar from '../components/SearchBar';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HelpCategory {
  id: string;
  label: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Process {
  id: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HELP_CATEGORIES: HelpCategory[] = [
  { id: '1', label: 'INC' },
  { id: '2', label: 'Med Cert' },
  { id: '3', label: 'Special Exam' },
  { id: '4', label: 'Drop' },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: 'Where do I submit my medical certificate?',
    answer:
      'You may submit your medical certificate at the Office of the University Registrar (OUR) or through the designated submission portal on the student portal.',
  },
  {
    id: '2',
    question: 'Is there a payment for the medical certificate?',
    answer:
      "Yes, there is a minimal processing fee. Please check the cashier's office or the official fee schedule for the exact amount.",
  },
  {
    id: '3',
    question: 'How do I get a medical certificate?',
    answer:
      'You can obtain a medical certificate from the University Health Services (UHS) or from a licensed physician. Make sure it is signed and bears the official clinic stamp.',
  },
];

const POPULAR_PROCESSES: Process[] = [
  { id: '1' }, { id: '2' }, { id: '3' },
  { id: '4' }, { id: '5' }, { id: '6' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HelpCategoryItem({ item }: { item: HelpCategory }) {
  return (
    <View style={styles.helpItem}>
      <View style={styles.helpCircle} />
      <Text style={styles.helpLabel}>{item.label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UserDashboard() {

  // ── Theme ─────────────────────────────────────────────────────────────────
  const colorScheme = useColorScheme() ?? "light";
  const colors      = Colors[colorScheme as "light" | "dark"];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>

      {/* Reusable Header — showBack=false hides the back arrow on dashboard */}
      <Header title="Welcome!" showBack={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar placeholder="Search..." />

        {/* Need Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.helpRow}>
            {HELP_CATEGORIES.map((item) => (
              <HelpCategoryItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Popular Processes */}
        <PopularProcesses processes={POPULAR_PROCESSES} />

        {/* FAQs */}
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

  // ── SafeArea & Layout ──────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    // backgroundColor removed here — now set dynamically via colors.background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  // paddingBottom: 160 ensures the last FAQ card clears the floating buttons
  scrollContent: {
    paddingBottom: 160,
  },

  // ── Sections ───────────────────────────────────────────────────────────────
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1340',
    marginBottom: 16,
  },

  // ── Need Help ──────────────────────────────────────────────────────────────
  helpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helpItem: {
    alignItems: 'center',
    flex: 1,
  },
  helpCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D8D3E8',
    marginBottom: 8,
  },
  helpLabel: {
    fontSize: 12,
    color: '#6B6485',
    fontWeight: '500',
    textAlign: 'center',
  },

});