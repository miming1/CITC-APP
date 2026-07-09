import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, useColorScheme, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AdminAuthModal from "../components/AdminAuthModal";
import AdminQuestionCategories from "../components/AdminQuestionCategories";
import FAQCard from "../components/FAQCard";
import FAQModal from "../components/FAQModal";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import UserQuestionCategories from "../components/UserQuestionCategories";
import { ENDPOINTS } from "../constants/api";
import { fetchFAQCategories, fetchFAQs } from "../lib/api";
import { getToken } from "../lib/auth";

type FAQ = {
  question: string;
  answer?: string;
};

export default function FAQScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const bg = isDark ? "#151718" : "#fff";
  const textPri = isDark ? "#ECEDEE" : "#1E1340";

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const {
    categoryId,
    roleId,
    admin_mode,
  } = useLocalSearchParams<{
    categoryId?: string;
    roleId?: string;
    admin_mode?: string;
  }>();

  const isAdmin =
    Number(roleId) === 2 ||
    admin_mode === "true";

  const [search, setSearch] = useState("");
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showAuthModal,setShowAuthModal] = useState(false);
  const [pendingFAQ,setPendingFAQ] = useState<FAQ | null>(null);
  const router = useRouter();

  const loadFAQs = async () => {
    try {
      setLoading(true); setError(null);
      const data = await fetchFAQs(categoryId ?? undefined);
      setFaqs(Array.isArray(data) ? data : []);
    } catch { setError("Could not load FAQs."); setFaqs([]); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try {
      setLoading(true); setError(null);
      const data = await fetchFAQCategories();
      setCategories(
        Array.isArray(data)
          ? data.map((item: any) => ({
              id: String(item.category_id),
              category_name: item.category_name,
              procedure_id: String(item.procedure),
            }))
          : []
      );
    } catch { setError("Unable to load categories."); setCategories([]); }
    finally { setLoading(false); }
  };

  useFocusEffect(
    useCallback(() => {
      categoryId ? loadFAQs() : loadCategories();
    }, [categoryId])
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return faqs;
    return faqs.filter(
      (item) => item.question?.toLowerCase().includes(q) || item.answer?.toLowerCase().includes(q)
    );
  }, [search, faqs]);

  const handleCreateFAQ = async (_procId: number, data: { question: string; answer?: string }) => {
    const token = await getToken();
    await fetch(ENDPOINTS.faqs.replace(/\/$/, "") + "/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      body: JSON.stringify({
        category: Number(categoryId),
        question: data.question,
        answer: data.answer ?? "",
      }),
    });
    setShowFAQModal(false);
    await loadFAQs();
  };

  const requestFAQAuth = (data: FAQ) => {
    setPendingFAQ(data);
    setShowAuthModal(true);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <Header
        title="FAQs"
        roleId={roleId as string}
        adminMode={admin_mode as string}
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={true}>
        <View style={[styles.container, isDesktop && styles.desktopContainer]}>
          <SearchBar placeholder="Search..." onChangeText={setSearch} />
          <Text style={[styles.sectionTitle, { color: textPri }]}>Frequently Asked Questions</Text>

          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#9B7FD4" />
            </View>
          )}

          {!loading && error && <Text style={styles.hint}>{error}</Text>}

          {!loading && !error && !categoryId && ( isAdmin ? (
              <AdminQuestionCategories
                procedures={[]}
                categories={categories.map((item) => ({
                  category_id: Number(item.id),
                  category_name: item.category_name,
                  procedure: Number(item.procedure_id),
                }))}
                onPressCategory={(category) => {
                  router.push({
                    pathname: "/faq",
                    params: {
                      categoryId: String(category.category_id),
                      roleId: "2",
                      admin_mode: "true",
                    },
                  });
                }}
              />
            ) : (
              <UserQuestionCategories
                categories={categories}
                onPressCategory={(category) => {
                  router.push({
                    pathname: "/faq",
                    params: {
                      categoryId: category.id,
                      roleId: "1",
                    },
                  });
                }}
              />
            )
          )}

          {!loading && !error && categoryId && (
            <View style={styles.cardList}>
              {filtered.map((item) => (
                <FAQCard key={item.id} question={item.question} answer={item.answer} />
              ))}
              {filtered.length === 0 && <Text style={styles.hint}>No FAQs found.</Text>}
            </View>
          )}
        </View>
      </ScrollView>

      {/*
        Rules:
        - Student -> Chat bubble only
        - Admin, category list -> Nothing
        - Admin, inside a category -> Add FAQ
      */}
      {isAdmin ? (
        categoryId ? (
          <FloatingButtons
            isAdmin
            adminIcon="add"
            adminTooltip="Add FAQ"
            onAdminPress={() => setShowFAQModal(true)}
          />
        ) : null
      ) : (
        <FloatingButtons activeTab="faq" />
      )}
      <FAQModal
        visible={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        procedureId={Number(categoryId)}
        onSave={handleCreateFAQ}
        onRequestAuth={requestFAQAuth}
      />

      <AdminAuthModal
        visible={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingFAQ(null);
        }}
        onSuccess={async () => {

          if (!pendingFAQ)
            return;


          await handleCreateFAQ(
            Number(categoryId),
            pendingFAQ
          );


          setShowAuthModal(false);
          setPendingFAQ(null);

        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 160 },

  container: { width: "100%" },
  desktopContainer: { width: "95%", maxWidth: 1600, alignSelf: "center" },

  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12, marginTop: 4, paddingHorizontal: 16 },
  cardList: { paddingHorizontal: 16 },
  centered: { alignItems: "center", paddingVertical: 40 },
  hint: { textAlign: "center", marginTop: 20, fontSize: 14, paddingHorizontal: 16 },
  categoryCard: { borderWidth: 1, borderColor: "#DDD", borderRadius: 10, padding: 16, marginBottom: 12 },
  categoryTitle: { fontSize: 16, fontWeight: "600" },
});