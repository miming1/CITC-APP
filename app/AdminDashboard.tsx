import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import AdminQuestionCategories from "../components/AdminQuestionCategories";
import AdminQuickActions from "../components/AdminQuickActions";
import AdminStatistics from "../components/AdminStatistics";
import AssignedProcedures from "../components/AssignedProcedures";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

import ManualCodeModal from "../components/ManualCodeModal";
import QRCodeModal from "../components/QRCodeModal";

import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getToken } from "../lib/auth";

// =========================
// TYPES
// =========================

type Procedure = {
  procedure_id: number;
  procedure_name: string;
  description?: string;
};

type FaqCategory = {
  category_id: number;
  category_name: string;
  procedure: number | null;
  faq_count: number;
};

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  // =========================
  // STATE
  // =========================

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([]);
  const [faqCount, setFaqCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [showQRModal, setShowQRModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // =========================
  // FETCH HELPERS
  // =========================

  async function safeFetch(res: Response) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      console.log("❌ Invalid JSON response:", text);
      return [];
    }
  }

  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      const token = await getToken();

      const headers = {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      };

      const [procRes, faqRes, catRes] = await Promise.all([
        fetch(ENDPOINTS.procedures, { headers }),
        fetch(ENDPOINTS.faqs, { headers }),
        fetch(ENDPOINTS.faqCategories, { headers }),
      ]);

      // ❗ IMPORTANT: do NOT silently hide errors
      if (!procRes.ok) console.log("Procedures API error:", procRes.status);
      if (!faqRes.ok) console.log("FAQs API error:", faqRes.status);
      if (!catRes.ok) console.log("Categories API error:", catRes.status);

      const procData = procRes.ok ? await safeFetch(procRes) : [];
      const faqData = faqRes.ok ? await faqRes.json() : { results: [] };
      const catData = catRes.ok ? await safeFetch(catRes) : [];

      // ❗ NO `.results` (your backend is NOT paginated)
      setProcedures(Array.isArray(procData) ? procData : []);
      setFaqCategories(Array.isArray(catData) ? catData : []);
      setFaqCount(Array.isArray(faqData) ? faqData.length : 0);
    } catch (err) {
      console.log("❌ ADMIN DASHBOARD ERROR:", err);

      setProcedures([]);
      setFaqCategories([]);
      setFaqCount(0);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // FILTER HELPERS
  // =========================

  const getCategoriesByProcedure = (procedureId: number) => {
    return faqCategories.filter(
      (cat) => Number(cat.procedure) === Number(procedureId)
    );
  };

  // =========================
  // LOADING UI
  // =========================

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ActivityIndicator
          size="large"
          color={Colors.light.tint}
          style={{ marginTop: 120 }}
        />
        <Text style={{ textAlign: "center", marginTop: 12, color: colors.text }}>
          Loading dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header
        title="Office Dashboard"
        showBack={false}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.pageContainer}>

          {/* SEARCH */}
          <SearchBar
            placeholder="Search..."
            onSearch={(query) =>
              router.push({
                pathname: "/SearchResults",
                params: {
                  query,
                  admin: "true",
                },
              })
            }
          />


          {/* QUICK ACTIONS */}
          <AdminQuickActions
            onScanQR={() => setShowQRModal(true)}
            onManualEntry={() => setShowManualModal(true)}
          />


          {/* STATISTICS */}
          <AdminStatistics
            procedures={procedures.length}
            requests={0}
            faqs={faqCount}
          />


          {/* PROCEDURES */}
          <AssignedProcedures
            procedures={procedures}
            onSeeAll={() =>
              router.push({
                pathname: "/process-list",
                params: { admin_mode: "true" },
              })
            }
            onPressProcedure={(procedure: Procedure) =>
              router.push({
                pathname: "/process",
                params: {
                  procedure_id: procedure.procedure_id,
                  roleId: 2,
                  admin_mode: "true",
                },
              })
            }
          />


          {/* FAQ CATEGORIES */}
          <AdminQuestionCategories
            procedures={procedures}
            categories={faqCategories}
            onPressCategory={(category) => {
              router.push({
                pathname: "/faq",
                params: {
                  categoryId: category.category_id,
                },
              });
            }}
            onSeeAll={() => {
              //router.push({ pathname: "/faq-categories" });
            }}
          />

        </View>
      </ScrollView>


      {/* MODALS */}

      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
      />

      <ManualCodeModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={(code) => {
          setShowManualModal(false);
          console.log("Manual code submitted:", code);
        }}
      />

    </SafeAreaView>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },


  // Controls the dashboard indentation
  // without moving the scrollbar
  pageContainer: {
    marginTop: 20,
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },


  scrollView: {
    flex: 1,
  },


  scroll: {
    paddingBottom: 120,
  },


  previewSection: {
    marginTop: 30,
  },


  previewTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },


  previewBlock: {
    marginBottom: 16,
  },


  procTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },


  categoryItem: {
    marginLeft: 12,
    fontSize: 14,
  },


  emptyText: {
    marginLeft: 12,
    fontSize: 13,
    opacity: 0.6,
  },

});