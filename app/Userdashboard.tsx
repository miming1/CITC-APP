import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCallback, useEffect, useMemo, useState } from "react";

import { API_BASE_URL } from "../constants/api";
import { Colors } from "../constants/theme";

import UserQuestionCategories from "@/components/User Components/UserFAQCategories";
import FloatingButtons from "../components/Universal Components/FloatingButtons";
import Header from "../components/Universal Components/Header";
import SearchBar from "../components/Universal Components/SearchBar";
import PopularProcesses from "../components/User Components/ProcedureCard";

import { getToken } from "../lib/auth";

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

  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme as "light" | "dark"];

  const { query } = useLocalSearchParams<{ query: string }>();
  const [search, setSearch] = useState(query ?? "");
  

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const bg = colors.background;
  const textPri = isDark ? "#ECEDEE" : "#1E1340";

  const [processes, setProcesses] = useState<Process[]>([]);
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset the search box every time this screen gains focus — including
  // when the user hits the back button from Search Results. Because the
  // box is now controlled (value={search}), clearing this state actually
  // clears what's visible instead of leaving stale typed text behind.
  useFocusEffect(
    useCallback(() => {
      setSearch("");
    }, [])
  );

  // =========================
  // FETCH PROCEDURES
  // =========================
  const fetchProcesses = async () => {
  try {
    const token = await getToken();

    if (!token) {
      console.log("NO TOKEN FOUND - user not authenticated");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/procedures/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

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
        title: item.procedure_name,
      }))
    );
  } catch (err) {
    console.log("fetchProcesses error:", err);
    setProcesses([]);
  }
};

  // =========================
  // FETCH FAQ CATEGORIES
  // =========================
  const fetchFaqCategories = async () => {
  try {
    const token = await getToken();

    if (!token) {
      console.log("NO TOKEN FOUND - skipping FAQ fetch");
      setFaqCategories([]);
      return;
    }

    const res = await fetch(`${API_BASE_URL}/faq-categories/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });

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

  // =========================
  // INIT LOAD
  // =========================
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      await Promise.all([fetchProcesses(), fetchFaqCategories()]);

      setLoading(false);
    };

    loadAll();
  }, []);

  // Feeds the SearchBar's autosuggest dropdown — this is what gives the
  // Dashboard the same "live matching while typing" feel that the FAQ page
  // already has (FAQ does it by filtering its own list; here there's no
  // list under the search bar to filter, so a dropdown is the equivalent).
  const suggestionPool = useMemo(
    () => [
      ...processes.map((p) => p.title),
      ...faqCategories.map((c) => c.category_name),
    ],
    [processes, faqCategories]
  );

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
        <View style={[styles.container, isDesktop && styles.desktopContainer]}>
          {/* SEARCH */}
          <View style={styles.searchBarWrap}>
            <SearchBar
              placeholder="Search..."
              value={search}
              suggestions={suggestionPool}
              onChangeText={setSearch}
              onSearch={(searchQuery) => {
                // Use the value the callback actually gives us instead of
                // the closured `search` state, and guard against an empty
                // string so nothing navigates on a blank submit.
                if (!searchQuery.trim()) return;
                router.push({
                  pathname: "/SearchResults",
                  params: { query: searchQuery, roleId: 1 },
                });
              }}
              onSelectSuggestion={(item) => {
                router.push({
                  pathname: "/SearchResults",
                  params: { query: item, roleId: 1 },
                });
              }}
            />
          </View>

          {/* POPULAR */}
          <PopularProcesses
            processes={processes}
            onPressProcess={(process) => {
              router.push({
                pathname: "/ProcedureTab",
                params: {
                  id: process.id,
                  roleId: 1,
                },
              });
            }}
            onSeeAll={() => {
              router.push({
                pathname: "/ProcedurePage",
                params: {
                  roleId: "1",
                },
              });
            }}
          />

          {/* QUESTION CATEGORIES */}
          <UserQuestionCategories
            categories={faqCategories}
            onPressCategory={(category) =>
              router.push({
                pathname: "/FAQPage",
                params: {
                  categoryId: category.id,
                  procedureId: category.procedure_id,
                  roleId: "1",
                },
              })
            }
            onSeeAll={() => {
              router.push({
                pathname: "/FAQPage",
                params: {
                  roleId: "1",
                },
              });
            }}
          />
        </View>
      </ScrollView>

      <FloatingButtons
        activeTab="faq"
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  container: {
    width: "100%",
    marginTop: 20,
    // SearchBar no longer supplies its own horizontal margin, so this
    // container now owns that spacing directly.
    paddingHorizontal: 16,
  },

  searchBarWrap: {
    marginBottom: 8,
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
    paddingBottom: 160,
  },
});