import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getToken } from "../lib/auth";

// =========================================================
// TYPES
// =========================================================

type Procedure = {
  procedure_id: number;
  procedure_name: string;
  description?: string;
};

type FAQ = {
  faq_id: number;
  question: string;
  answer?: string;
};

// =========================================================
// SCREEN
// =========================================================

export default function AdminDashboard() {

  const colorScheme = useColorScheme() ?? "light";

  const colors = Colors[colorScheme as "light" | "dark"];

  const TINT = Colors.light.tint;

  // =========================================================
  // STATES
  // =========================================================

  const [procedures, setProcedures] = useState<Procedure[]>([]);

  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // FETCH DATA
  // =========================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {

    try {

      const token = await getToken();

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      };

      // =============================================
      // FETCH PROCEDURES
      // =============================================

      const proceduresRes = await fetch(
        ENDPOINTS.procedures,
        {
          headers,
        }
      );

      const proceduresData = await proceduresRes.json();

      // =============================================
      // FETCH FAQS
      // =============================================

      const faqsRes = await fetch(
        ENDPOINTS.faqs,
        {
          headers,
        }
      );

      const faqsData = await faqsRes.json();

      setProcedures(proceduresData || []);

      setFaqs(faqsData || []);

    }

    catch (error) {

      console.log("ADMIN DASHBOARD ERROR:", error);

    }

    finally {

      setLoading(false);

    }

  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <SafeAreaView
        style={[
          s.safe,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={s.loaderWrap}>
          <ActivityIndicator size="large" color={TINT} />
          <Text style={s.loadingText}>
            Loading Admin Dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );

  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <SafeAreaView
      style={[
        s.safe,
        {
          backgroundColor: colors.background,
        },
      ]}
    >

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={s.header}>

          <Text style={s.title}>
            Admin Dashboard
          </Text>

          <Text style={s.subtitle}>
            Manage procedures and FAQs
          </Text>

        </View>

        {/* ================================================= */}
        {/* QUICK STATS */}
        {/* ================================================= */}

        <View style={s.statsRow}>

          <View style={[s.statCard, { backgroundColor: "#EEE7FF" }]}>
            <Text style={s.statNumber}>
              {procedures.length}
            </Text>
            <Text style={s.statLabel}>
              Procedures
            </Text>
          </View>

          <View style={[s.statCard, { backgroundColor: "#F3ECFF" }]}>
            <Text style={s.statNumber}>
              {faqs.length}
            </Text>
            <Text style={s.statLabel}>
              FAQs
            </Text>
          </View>

        </View>

        {/* ================================================= */}
        {/* PROCEDURES */}
        {/* ================================================= */}

        <View style={s.sectionHeader}>

          <Text style={s.sectionTitle}>
            Current Procedures
          </Text>

        </View>

        <FlatList
          data={procedures}
          scrollEnabled={false}
          keyExtractor={(item) => item.procedure_id.toString()}
          renderItem={({ item }) => (

            <TouchableOpacity
              activeOpacity={0.85}
              style={s.card}
              onPress={() => {

                router.push({
                  pathname: "/process",
                  params: {
                    procedure_id: item.procedure_id,
                    roleId: 2,
                    admin_mode: "true",
                  },
                });

              }}
            >

              <Text style={s.cardTitle}>
                {item.procedure_name}
              </Text>

              <Text style={s.cardDescription} numberOfLines={2}>
                {item.description || "No description available."}
              </Text>

            </TouchableOpacity>

          )}
        />

        {/* ================================================= */}
        {/* FAQS */}
        {/* ================================================= */}

        <View style={s.sectionHeader}>

          <Text style={s.sectionTitle}>
            FAQs
          </Text>

        </View>

        <FlatList
          data={faqs}
          scrollEnabled={false}
          keyExtractor={(item) => item.faq_id.toString()}
          renderItem={({ item }) => (

            <View style={s.faqCard}>

              <Text style={s.faqQuestion}>
                {item.question}
              </Text>

              <Text style={s.faqAnswer} numberOfLines={3}>
                {item.answer || "No answer available."}
              </Text>

            </View>

          )}
        />

      </ScrollView>

    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const s = StyleSheet.create({

  safe: {
    flex: 1,
  },

  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#5D429D",
    fontWeight: "600",
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#422780",
  },

  subtitle: {
    marginTop: 6,
    color: "#6B5A8E",
    fontSize: 14,
  },

  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 28,
  },

  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#422780",
  },

  statLabel: {
    marginTop: 6,
    fontSize: 13,
    color: "#5D429D",
    fontWeight: "600",
  },

  sectionHeader: {
    marginBottom: 12,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#422780",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,

    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#422780",
    marginBottom: 6,
  },

  cardDescription: {
    fontSize: 13,
    color: "#6B5A8E",
    lineHeight: 20,
  },

  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#EEE7FF",
  },

  faqQuestion: {
    fontSize: 15,
    fontWeight: "700",
    color: "#422780",
    marginBottom: 8,
  },

  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B5A8E",
  },

});