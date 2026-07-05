import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEffect, useState } from 'react';

import { Colors } from '../constants/theme';

import FAQCard from '../components/FAQCard';
import FloatingButtons from '../components/FloatingButtons';
import Header from '../components/Header';
import PopularProcesses from '../components/PopularProcesses';
import SearchBar from '../components/SearchBar';

import { API_BASE_URL } from '../constants/api';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Process {
  id: string;
  title: string;
}

// -----------------------------------------------------------
// Icon lookup for Quick Access shortcuts.
// This is a display heuristic only — the underlying process
// list is still fetched dynamically, nothing here is hardcoded
// data, just a keyword -> icon mapping so cards don't render
// with a blank icon. Adjust keywords/icons to match your
// actual procedure_name values from the API.
// -----------------------------------------------------------
function getProcessIcon(title: string): keyof typeof Ionicons.glyphMap {
  const t = title.toLowerCase();
  if (t.includes('med')) return 'medkit-outline';
  if (t.includes('special exam')) return 'clipboard-outline';
  if (t.includes('add') || t.includes('drop')) return 'swap-horizontal-outline';
  if (t.includes('good moral')) return 'ribbon-outline';
  if (t.includes('leave')) return 'exit-outline';
  return 'document-text-outline';
}

export default function UserDashboardWeb() {
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const bg = colors.background;
  const textPri = isDark ? '#ECEDEE' : '#1E1340';
  const accent = '#4B39EF';

  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [topFaqs, setTopFaqs] = useState<FAQItem[]>([]);

  // =========================
  // FETCH PROCEDURES
  // =========================
  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/procedures/`, { cache: 'no-store' });
      const data = await res.json();

      const mapped = data.map((item: any) => ({
        id: String(item.procedure_id),
        title: item.procedure_name ?? item.title,
      }));

      setProcesses(mapped);
    } catch (err) {
      console.log('Failed to fetch processes:', err);
    }
  };

  // =========================
  // FAQS
  // NOTE: endpoint below is assumed — confirm the real route/shape
  // for returning individual FAQ question/answer pairs (this dashboard
  // previously only fetched FAQ *categories*, which FAQCard can't render
  // directly since it needs `question` and `answer`, not a category name).
  // =========================
  const fetchTopFaqs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/faqs/`, { cache: 'no-store' });
      const data = await res.json();

      const mapped: FAQItem[] = data.map((item: any) => ({
        id: String(item.faq_id ?? item.id),
        question: item.question,
        answer: item.answer,
      }));

      // Show only a handful on the dashboard; full list lives on /faq
      setTopFaqs(mapped.slice(0, 3));
    } catch (err) {
      console.log('Failed to fetch FAQs:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      await Promise.all([fetchProcesses(), fetchTopFaqs()]);

      setLoading(false);
    };

    loadAll();
  }, []);

  const quickAccessItems = processes.slice(0, 5);

  const goToProcess = (process: Process) =>
    router.push({
      pathname: '/process',
      params: { id: process.id, roleId: 1 },
    });

  // =========================
  // UI
  // =========================
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <Header title="Welcome!" showBack={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageContainer}>
          {/* SEARCH */}
          <View style={styles.searchWrap}>
            <SearchBar
              placeholder="Search processes, offices..."
              onSearch={(query) => {
                router.push({
                  pathname: '/SearchResults',
                  params: { query },
                });
              }}
            />
          </View>

          {/* TWO-COLUMN WEB LAYOUT */}
          <View style={styles.columns}>
            {/* MAIN COLUMN */}
            <View style={styles.mainColumn}>
              {/* QUICK ACCESS */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textPri }]}>
                  Quick Access
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Tap a shortcut to start your request
                </Text>

                <View style={styles.quickAccessGrid}>
                  {quickAccessItems.map((process) => (
                    <TouchableOpacity
                      key={process.id}
                      style={[
                        styles.quickAccessCard,
                        { backgroundColor: colors.background, borderColor: colors.border },
                      ]}
                      onPress={() => goToProcess(process)}
                    >
                      <View
                        style={[
                          styles.quickAccessIconWrap,
                          { backgroundColor: isDark ? '#2A2440' : '#EDEBFB' },
                        ]}
                      >
                        <Ionicons
                          name={getProcessIcon(process.title)}
                          size={26}
                          color={accent}
                        />
                      </View>
                      <Text
                        style={[styles.quickAccessLabel, { color: textPri }]}
                        numberOfLines={2}
                      >
                        {process.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* POPULAR PROCESSES */}
              <View style={styles.section}>
                <PopularProcesses
                  processes={processes}
                  onPressProcess={goToProcess}
                  onSeeAll={() => router.push('/process')}
                />
              </View>
            </View>

            {/* SIDEBAR COLUMN: FAQS */}
            <View style={styles.sidebarColumn}>
              <View
                style={[
                  styles.faqPanel,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: textPri }]}>FAQs</Text>
                  <TouchableOpacity onPress={() => router.push('/faq')}>
                    <Text style={[styles.seeAll, { color: accent }]}>See all &gt;</Text>
                  </TouchableOpacity>
                </View>

                {topFaqs.map((faq) => (
                  <FAQCard key={faq.id} question={faq.question} answer={faq.answer} />
                ))}

                {!loading && topFaqs.length === 0 && (
                  <Text style={styles.faqEmpty}>No FAQs yet.</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <FloatingButtons
        activeTab="faq"
        onTrackPress={() => router.push('/track-details')}
        onFAQPress={() => router.push('/faq')}
      />
    </SafeAreaView>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  pageContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 24,
  },

  searchWrap: {
    maxWidth: 640,
    marginBottom: 8,
  },

  columns: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 32,
  },

  mainColumn: {
    flex: 2,
    minWidth: 0,
  },

  sidebarColumn: {
    flex: 1,
    minWidth: 280,
  },

  section: {
    marginBottom: 32,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#8A8A8A',
    marginBottom: 16,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },

  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  quickAccessCard: {
    width: 120,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },

  quickAccessIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  quickAccessLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  faqPanel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },

  faqEmpty: {
    fontSize: 13,
    color: '#8A8A8A',
    paddingTop: 12,
  },
});