import { useRouter } from 'expo-router';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from 'react';

import { Colors } from "../constants/theme";

import FloatingButtons from '../components/FloatingButtons';
import Header from '../components/Header';
import PopularProcesses from '../components/PopularProcesses';
import SearchBar from '../components/SearchBar';

import { API_BASE_URL } from "../constants/api";

interface FAQCategory {
  id: string;
  category_name: string;
  procedure_id: string;
}

interface Process {
  id: string;
  title: string;
}

export default function UserDashboard() {
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const bg = colors.background;
  const textPri = isDark ? '#ECEDEE' : '#1E1340';

  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);

  // =========================
  // FETCH PROCEDURES
  // =========================
  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/procedures/`, { cache: "no-store" });
      const data = await res.json();

      const mapped = data.map((item: any) => ({
        id: String(item.procedure_id), 
        title: item.procedure_name ?? item.title,
      }));

      setProcesses(mapped);
    } catch (err) {
      console.log("Failed to fetch processes:", err);
    }
  };



  // =========================
  // FAQS
  // =========================
  const fetchFaqCategories = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/faq-categories/`,
        { cache: "no-store" } 
      );

      const data = await res.json();

      const mapped = data.map((item: any) => ({
        id: String(item.category_id),
        category_name: item.category_name,
        procedure_id: String(item.procedure),
      }));

      setFaqCategories(mapped);
    } catch (err) {
      console.log(
        "Failed to fetch FAQ categories:",
        err
      );
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      await Promise.all([
        fetchProcesses(),
        fetchFaqCategories(),
      ]);

      setLoading(false);
    };

    loadAll();
  }, []);

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
        <View
          style={[
            styles.container,
            isDesktop && styles.desktopContainer,
          ]}
        >
          {/* SEARCH */}
          <SearchBar
            placeholder="Search..."
            onSearch={(query) => {
              router.push({
                pathname: "/SearchResults",
                params: { query },
              });
            }}
          />

          {/* POPULAR */}
          <PopularProcesses
            processes={processes}
            onPressProcess={(process: Process) =>
              router.push({
                pathname: "/process",
                params: {
                  id: process.id,
                  roleId: 1,
                },
              })
            }
          />

          {/* QUESTION CATEGORIES */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: textPri },
              ]}
            >
              Question Categories
            </Text>

            {faqCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/faq",
                    params: {
                      categoryId: category.id,
                      procedureId: category.procedure_id,
                    },
                  })
                }
              >
                <Text
                  style={[
                    styles.categoryTitle,
                    { color: textPri },
                  ]}
                >
                  {category.category_name}
                </Text>
              </TouchableOpacity>
            ))}
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
    paddingTop: Platform.OS === 'android'
      ? StatusBar.currentHeight
      : 0,
  },

  container: {
    width: "100%",
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

  categoryTitle: {
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 20,
  },
});