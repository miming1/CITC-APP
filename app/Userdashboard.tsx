import { useRouter } from "expo-router";
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

import { useEffect, useState } from "react";

import { API_BASE_URL } from "../constants/api";
import { Colors } from "../constants/theme";

import UserQuestionCategories from "@/components/UserQuestionCategories";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import PopularProcesses from "../components/PopularProcesses";
import SearchBar from "../components/SearchBar";

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

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const bg = colors.background;
  const textPri = isDark ? "#ECEDEE" : "#1E1340";

  const [processes, setProcesses] = useState<Process[]>([]);
  const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);

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
              router.push({
                pathname: "/process-list",
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
                pathname: "/faq",
                params: {
                  categoryId: category.id,
                  procedureId: category.procedure_id,
                  roleId: "1",
                },
              })
            }
            onSeeAll={() => {
              router.push({
                pathname: "/faq",
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