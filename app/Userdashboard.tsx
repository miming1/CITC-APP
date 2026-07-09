import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from 'react';

import { API_BASE_URL } from "../constants/api";
import { Colors } from "../constants/theme";

import UserQuestionCategories from "@/components/UserQuestionCategories";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import PopularProcesses from "../components/PopularProcesses";
import SearchBar from "../components/SearchBar";

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

    console.log("PROCEDURES:", res.status, data);

    if (!res.ok) return;

    if (!Array.isArray(data)) {
      setProcesses([]); 
      return;
    }

    setProcesses(
      data.map((item: any) => ({
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

    console.log("FAQ:", res.status, data);

    if (!res.ok) {
      setFaqCategories([]);
      return;
    }

    if (!Array.isArray(data)) {
      setFaqCategories([]); 
      return;
    }

    setFaqCategories(
      data.map((item: any) => ({
        id: String(item.category_id),
        category_name: item.category_name,
        procedure_id: String(item.procedure),
      }))
    );
  } catch (err) {
    console.log("fetchFaqCategories error:", err);
    setFaqCategories([]); 
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <Header title="Welcome!" showBack={false} roleId={1} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
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

          {/* POPULAR */}
          <PopularProcesses
            processes={processes}
            onPressProcess={(process) => {
              router.push({
                pathname: "/process",
                params: {
                  id: process.id,
                  roleId: 1,
                },
              });
            }}
            onSeeAll={() => {
              router.push("/process-list");
            }}
          />

          {/* QUESTION CATEGORIES */}
          <UserQuestionCategories
            categories={faqCategories}
            onPressCategory={(category) =>
              router.push({
                pathname: "/faq",
                params: {
                  categoryId: category.id,
                  procedureId: category.procedure_id,
                },
              })
            }
            onSeeAll={() => {
              // router.push("/categorylistscreen");
            }}
          />
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  container: {
    width: "100%",
    marginTop: 20,
  },

  desktopContainer: {
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },

  categoryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
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
});