import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
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
import FAQCard from '../components/FAQCard';
import Header from '../components/Header';
import PopularProcesses from '../components/PopularProcesses';
import SearchBar from '../components/SearchBar';
import { Colors } from "../constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickAccessItem {
  id: string;
  label: string;
  processId: string;
  icon: string;
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

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  { id: '1', label: 'INC',          processId: '4', icon: 'file-document-edit-outline' },
  { id: '2', label: 'Med Cert',     processId: '5', icon: 'medical-bag' },
  { id: '3', label: 'Special Exam', processId: '1', icon: 'clipboard-text-outline' },
  { id: '4', label: 'Drop',         processId: '3', icon: 'calendar-remove-outline' },
  { id: '5', label: 'Good Moral',   processId: '2', icon: 'certificate-outline' },
  { id: '6', label: 'Excuse Ltr',   processId: '6', icon: 'email-outline' },
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
  { id: '6', title: 'Good Moral Certificate' },
  { id: '7', title: 'Excuse Letter' },
  { id: '8', title: 'Scholarship Application' },
];

const ALL_SUGGESTIONS = [
  'Special Exam',
  'Petition for Completion',
  'Leave of Absence',
  'INC Form',
  'Medical Certificate Submission',
  'Good Moral Certificate',
  'Excuse Letter Submission',
  'Scholarship Application',
  'Grade Appeal',
  'Enrollment Assistance',
  'Drop Subject',
  'Shifting of Course',
  "Dean's Office",
  'Faculty Office',
  'TCM Office',
  'Registrar Office',
];

// ─── QuickAccessItem sub-component ───────────────────────────────────────────

function QuickAccessItemCard({
  item,
  isDark,
  circleSize,
}: {
  item: QuickAccessItem;
  isDark: boolean;
  circleSize: number;
}) {
  const router = useRouter();
  const iconSize = Math.round(circleSize * 0.42);

  return (
    <TouchableOpacity
      style={[styles.quickItem, { width: circleSize + 12 }]}
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
          styles.quickCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: isDark ? '#2A2040' : '#D8D3E8',
          },
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={iconSize}
          color={isDark ? '#C8B8FF' : '#5D3FD3'}
        />
      </View>
      <Text
        style={[
          styles.quickLabel,
          { color: isDark ? '#9BA1A6' : '#6B6485' },
        ]}
        numberOfLines={2}
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
  const accentColor = isDark ? '#B8A4FF' : '#5D3FD3';

  // ── Responsive circle size ────────────────────────────────────────────────
  const screenWidth = Dimensions.get('window').width;
  const itemCount = QUICK_ACCESS_ITEMS.length;
  const COLS = itemCount <= 4 ? 4 : Math.min(itemCount, 6);
  const horizontalPadding = 32;
  const totalGap = (COLS - 1) * 8;
  const availableWidth = screenWidth - horizontalPadding - totalGap;
  const circleSize = Math.max(44, Math.min(64, Math.floor(availableWidth / COLS)));

  // ── Search suggestions ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.trim().length > 0);
  };

  const handleSearchSubmit = (query: string) => {
    setShowSuggestions(false);
    router.push({ pathname: '/SearchResults', params: { query } });
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push({ pathname: '/SearchResults', params: { query: suggestion } });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <Header title="Welcome!" showBack={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search Bar with suggestions ─────────────────────────────── */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search processes, offices..."
            onSearch={handleSearchSubmit}
            onChangeText={handleSearchChange}
          />
          {showSuggestions && suggestions.length > 0 && (
            <View
              style={[
                styles.suggestionsBox,
                {
                  backgroundColor: isDark ? '#1E1E2E' : '#fff',
                  borderColor: isDark ? '#2A2040' : '#E2DBF0',
                },
              ]}
            >
              {suggestions.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.suggestionRow,
                    { borderBottomColor: isDark ? '#2A2040' : '#F0EBF8' },
                  ]}
                  onPress={() => handleSuggestionPress(s)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="magnify"
                    size={16}
                    color={isDark ? '#7A6A99' : '#9B7FD4'}
                    style={styles.suggestionIcon}
                    aria-hidden={true}
                  />
                  <Text style={[styles.suggestionText, { color: textPri }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Quick Access ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPri }]}>
            Quick Access
          </Text>
          <Text style={[styles.sectionSubtitle, { color: isDark ? '#6B6485' : '#9B8FBB' }]}>
            Tap a shortcut to start your request
          </Text>

          <View style={styles.quickRow}>
            {QUICK_ACCESS_ITEMS.map((item) => (
              <QuickAccessItemCard
                key={item.id}
                item={item}
                isDark={isDark}
                circleSize={circleSize}
              />
            ))}
          </View>
        </View>

        {/* ── Popular Processes ────────────────────────────────────────── */}
        {/* NOTE: the "Popular Processes" title + See all lives HERE only. */}
        {/* If your PopularProcesses component also renders its own title,  */}
        {/* remove that title from inside the component to avoid duplicates. */}
        <View style={styles.sectionSpacing}>
          <TouchableOpacity
            style={styles.sectionHeaderRow}
            onPress={() => router.push('/process-list')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { color: textPri }]}>
              Popular Processes
            </Text>
            <View style={styles.seeAllChip}>
              <Text style={[styles.seeAllText, { color: accentColor }]}>
                See all
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={accentColor}
              />
            </View>
          </TouchableOpacity>

          <PopularProcesses
            processes={POPULAR_PROCESSES}
            onPressProcess={(process: Process) =>
              router.push({
                pathname: '/process',
                params: { id: process.id, roleId: 1 },
              })
            }
          />
        </View>

        {/* ── FAQs ─────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeaderRow}
            onPress={() => router.push('/faq')}
            activeOpacity={0.7}
          >
            <Text style={[styles.sectionTitle, { color: textPri }]}>
              FAQs
            </Text>
            <View style={styles.seeAllChip}>
              <Text style={[styles.seeAllText, { color: accentColor }]}>
                See all
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={accentColor}
              />
            </View>
          </TouchableOpacity>

          {FAQ_ITEMS.map((item) => (
            <FAQCard
              key={item.id}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </View>
      </ScrollView>

      {/* ── Chat FAB ─────────────────────────────────────────────────── */}
      <ChatFloatingButton onPress={() => router.push('/chatbot')} />
    </SafeAreaView>
  );
}

// ─── Chat FAB ─────────────────────────────────────────────────────────────────

function ChatFloatingButton({ onPress }: { onPress: () => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  return (
    <View style={fabStyles.container}>
      <TouchableOpacity
        style={[fabStyles.button, { backgroundColor: colors.tint }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="chat-processing-outline" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  scrollView: { flex: 1 },

  scrollContent: { paddingBottom: 160 },

  // ── Search wrapper ─────────────────────────────────────────────────────────
  searchWrapper: {
    position: 'relative',
    zIndex: 100,
  },

  suggestionsBox: {
    position: 'absolute',
    top: '100%',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    zIndex: 200,
  },

  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },

  suggestionIcon: { marginRight: 10 },

  suggestionText: {
    fontSize: 14,
    flex: 1,
  },

  // ── Section ────────────────────────────────────────────────────────────────
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  sectionSpacing: {
    marginTop: 24,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 14,
    marginTop: 2,
  },

  seeAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Quick Access ───────────────────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  quickItem: {
    alignItems: 'center',
    marginBottom: 8,
  },

  quickCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  quickLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
});

const fabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    bottom: 40,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});