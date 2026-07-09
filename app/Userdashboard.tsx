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

export default function UserDashboard() {
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  // Page backdrop is a shade off-white/off-black so the white/dark
  // panel cards actually read as raised surfaces instead of blending
  // into the background.
  const pageBg = isDark ? '#0F0B1A' : '#F4F4FA';
  const cardBg = colors.background;
  const textPri = isDark ? '#ECEDEE' : '#1E1340';
  const textMuted = isDark ? '#9A93B0' : '#8A8A9A';
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

  // Shared "panel card" look, applied inline so it can pick up
  // theme-aware colors (background/border) at render time.
  const panelStyle = [
    styles.panelCard,
    { backgroundColor: cardBg, borderColor: colors.border },
  ];

  // =========================
  // UI
  // =========================
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: pageBg }]}>
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
              <View style={[panelStyle, styles.section]}>
                <Text style={[styles.sectionTitle, { color: textPri }]}>
                  Quick Access
                </Text>
                <Text style={[styles.sectionSubtitle, { color: textMuted }]}>
                  Tap a shortcut to start your request
                </Text>

                {quickAccessItems.length > 0 ? (
                  <View style={styles.quickAccessGrid}>
                    {quickAccessItems.map((process) => (
                      <TouchableOpacity
                        key={process.id}
                        style={[
                          styles.quickAccessCard,
                          { backgroundColor: isDark ? '#1B1730' : '#FAFAFF', borderColor: colors.border },
                        ]}
                        onPress={() => goToProcess(process)}
                        activeOpacity={0.75}
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
                ) : (
                  <EmptyState
                    loading={loading}
                    icon="apps-outline"
                    textMuted={textMuted}
                    loadingLabel="Loading shortcuts..."
                    emptyLabel="No processes available yet."
                  />
                )}
              </View>

              {/* POPULAR PROCESSES */}
              <View style={[panelStyle, styles.section]}>
                {processes.length > 0 ? (
                  <PopularProcesses
                    processes={processes}
                    onPressProcess={goToProcess}
                    onSeeAll={() => router.push('/process')}
                  />
                ) : (
                  <>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={[styles.sectionTitle, { color: textPri }]}>
                        Popular Processes
                      </Text>
                      <TouchableOpacity onPress={() => router.push('/process')}>
                        <Text style={[styles.seeAll, { color: accent }]}>See all &gt;</Text>
                      </TouchableOpacity>
                    </View>
                    <EmptyState
                      loading={loading}
                      icon="file-tray-outline"
                      textMuted={textMuted}
                      loadingLabel="Loading processes..."
                      emptyLabel="No popular processes yet."
                    />
                  </>
                )}
              </View>
            </View>

            {/* SIDEBAR COLUMN: FAQS */}
            <View style={styles.sidebarColumn}>
              <View style={panelStyle}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: textPri }]}>FAQs</Text>
                  <TouchableOpacity onPress={() => router.push('/faq')}>
                    <Text style={[styles.seeAll, { color: accent }]}>See all &gt;</Text>
                  </TouchableOpacity>
                </View>

                {topFaqs.length > 0 ? (
                  topFaqs.map((faq) => (
                    <FAQCard key={faq.id} question={faq.question} answer={faq.answer} />
                  ))
                ) : (
                  <EmptyState
                    loading={loading}
                    icon="help-circle-outline"
                    textMuted={textMuted}
                    loadingLabel="Loading FAQs..."
                    emptyLabel="No FAQs yet."
                  />
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

// -----------------------------------------------------------
// Small local empty/loading state — used instead of a bare line
// of gray text so panels don't look broken while data is missing.
// -----------------------------------------------------------
function EmptyState({
  loading,
  icon,
  textMuted,
  loadingLabel,
  emptyLabel,
}: {
  loading: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  textMuted: string;
  loadingLabel: string;
  emptyLabel: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={28} color={textMuted} style={{ marginBottom: 8 }} />
      <Text style={[styles.emptyStateText, { color: textMuted }]}>
        {loading ? loadingLabel : emptyLabel}
      </Text>
    </View>
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
    paddingTop: 28,
  },

  searchWrap: {
    maxWidth: 640,
    marginBottom: 24,
  },

  columns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },

  mainColumn: {
    flex: 1,
    minWidth: 0,
  },

  sidebarColumn: {
    width: 340,
  },

  // Shared raised-card look for every dashboard widget
  panelCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1E1340',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  section: {
    marginBottom: 24,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },

  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  quickAccessCard: {
    width: 128,
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

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },

  emptyStateText: {
    fontSize: 13,
    fontWeight: '500',
  },
});