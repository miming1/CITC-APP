import { useRouter } from 'expo-router';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

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
  processId: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Process {
  id: string;
  title: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HELP_CATEGORIES: HelpCategory[] = [
  { id: '1', label: 'INC', processId: '4' },
  { id: '2', label: 'Med Cert', processId: '5' },
  { id: '3', label: 'Special Exam', processId: '1' },
  { id: '4', label: 'Drop', processId: '3' },
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
  { id: '1', title: 'Special Exam' },
  { id: '2', title: 'Petition for C..' },
  { id: '3', title: 'Leave of Absence' },
  { id: '4', title: 'INC' },
  { id: '5', title: 'Medical Certificate Sub..' },
  { id: '6', title: 'Process 6' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function HelpCategoryItem({
  item,
  isDark,
}: {
  item: HelpCategory;
  isDark: boolean;
}) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.helpItem}
      onPress={() =>
        router.push({
          pathname: '/process',
          params: { id: item.processId },
        })
      }
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.helpCircle,
          { backgroundColor: isDark ? '#2A2040' : '#D8D3E8' },
        ]}
      />

      <Text
        style={[
          styles.helpLabel,
          { color: isDark ? '#9BA1A6' : '#6B6485' },
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function UserDashboard() {
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const colors = Colors[colorScheme as 'light' | 'dark'];

  const bg = colors.background;
  const textPri = isDark ? '#ECEDEE' : '#1E1340';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <Header title="Welcome!" showBack={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar
          placeholder="Search..."
          onSearch={(query) => {
            router.push({
              pathname: '/SearchResults',
              params: { query },
            });
          }}
        />

        {/* Need Help */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPri }]}>
            Need Help?
          </Text>

          <View style={styles.helpRow}>
            {HELP_CATEGORIES.map((item) => (
              <HelpCategoryItem
                key={item.id}
                item={item}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        {/* Popular Processes */}
        <PopularProcesses
          processes={POPULAR_PROCESSES}
          onPressProcess={(process: Process) =>
            router.push({
              pathname: '/process',
              params: { id: process.id },
            })
          }
        />

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPri }]}>
            FAQs
          </Text>

          {FAQ_ITEMS.map((item) => (
            <FAQCard
              key={item.id}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </View>
      </ScrollView>

      <FloatingButtons 
        activeTab="faq" 
        onTrackPress={() => router.push('/track-details')}
        onQuestionPress={() => router.push('/faq')}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android'
      ? StatusBar.currentHeight
      : 0,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 160,
  },

  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },

  // ── Need Help ────────────────────────────────────────────────────────────

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
    marginBottom: 8,
  },

  helpLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});