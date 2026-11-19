import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";

import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import AdminFAQCategories from "../components/Admin Components/AdminFAQCategories";
import AssignedProcedures from "../components/Admin Components/AdminProcedures";
import Header from "../components/Universal Components/Header";
import SearchBar from "../components/Universal Components/SearchBar";

import ManualCodeModal from "../components/Admin Components/ManualCodeModal";
import QRCodeModal from "../components/Admin Components/QRCodeModal";

import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { fetchAdminStatistics, searchRequestByReference } from "../lib/api";
import { getToken } from "../lib/auth";
import { canManageAccounts, canScan, useMe } from "../lib/roles";

type Procedure = {
  procedure_id: number;
  procedure_name: string;
  description?: string;
  is_mine?: boolean;
};

type FaqCategory = {
  category_id: number;
  category_name: string;
  procedure: number | null;
  faq_count: number;
};

const NAVY = "#141A73";
const GOLD = "#EBA937";

function ActionTile({ icon, title, subtitle, accent, iconBg, bg, border, text, sub, onPress }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.tile, { backgroundColor: bg, borderColor: border }]}
    >
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={24} color={accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.tileTitle, { color: text }]} numberOfLines={1}>{title}</Text>
        <Text style={{ color: sub, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={accent} />
    </TouchableOpacity>
  );
}

function StatTile({ icon, label, value, accent, bg, border, sub }: any) {
  return (
    <View style={[styles.statTile, { backgroundColor: bg, borderColor: border }]}>
      <MaterialIcons name={icon} size={22} color={accent} />
      <Text style={[styles.statValue, { color: accent }]}>{value ?? 0}</Text>
      <Text style={{ color: sub, fontSize: 13, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const isDark = theme === "dark";
  const colors = Colors[theme];
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const me = useMe();
  const role: number = me?.role_id ?? 0;

  const [stats, setStats] = useState<any>({ procedures: 0, faqs: 0, requests: 0 });
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  async function safeFetch(res: Response) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.log("Invalid JSON response:", text);
      return [];
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setStats(await fetchAdminStatistics());
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

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

      const [procRes, catRes] = await Promise.all([
        fetch(ENDPOINTS.procedures, { headers }),
        fetch(ENDPOINTS.faqCategories, { headers }),
      ]);

      const procData = procRes.ok ? await safeFetch(procRes) : [];
      const catData = catRes.ok ? await safeFetch(catRes) : [];

      setProcedures(Array.isArray(procData) ? procData : []);
      setFaqCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.log("ADMIN DASHBOARD ERROR:", err);
      setProcedures([]);
      setFaqCategories([]);
    } finally {
      setLoading(false);
    }
  }

  const goProcedure = (p: Procedure) =>
    router.push({
      pathname: "/ProcedureTab",
      params: { id: p.procedure_id, roleId: "2" },
    });

  const goAllProcedures = () =>
    router.push({ pathname: "/ProcedurePage", params: { roleId: "2" } });

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 120 }} />
        <Text style={{ textAlign: "center", marginTop: 12, color: colors.text }}>
          Loading dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  const cardBg = isDark ? "#1F2937" : "#F8FAFC";

  // ---- reusable blocks (same components/props as before) ----
  const proceduresBlock = (
    <AssignedProcedures
      title={role === 2 || role === 3 ? "All Procedures" : undefined}
      procedures={procedures}
      onPressProcedure={goProcedure}
      onSeeAll={goAllProcedures}
    />
  );

  const faqBlock = (
    <AdminFAQCategories
      procedures={procedures}
      categories={faqCategories}
      onPressCategory={(category) =>
        router.push({
          pathname: "/FAQPage",
          params: { categoryId: String(category.category_id), roleId: "2" },
        })
      }
      onSeeAll={() => router.push({ pathname: "/FAQPage", params: { roleId: "2" } })}
    />
  );

  const accountChips = stats.accounts
    ? [
        { label: "Students", value: stats.accounts.students },
        { label: "Deans", value: stats.accounts.deans },
        { label: "Chairpersons", value: stats.accounts.chairpersons },
        { label: "Staff", value: stats.accounts.staff },
        { label: "Faculty", value: stats.accounts.faculty },
      ]
    : [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Header
        title={role === 2 ? "Operational Admin Dashboard" : "Office Dashboard"}
        showBack={false}
        adminMode="true"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.pageContainer}>
          {/* SEARCH */}
          <View style={styles.searchWrap}>
            <SearchBar
              placeholder="Search..."
              onSearch={(query) =>
                router.push({
                  pathname: "/SearchResults",
                  params: { query, admin: "true" },
                })
              }
            />
          </View>

          {/* QUICK ACTIONS: equal-size tiles */}
          {(canScan(role) || canManageAccounts(role)) && (
            <View style={styles.tileRow}>
              {canScan(role) && (
                <>
                  <ActionTile
                    icon="qr-code-scanner"
                    title="Scan QR"
                    subtitle="Scan document code"
                    accent={isDark ? "#93C5FD" : NAVY}
                    iconBg={isDark ? "#1E3A8A" : "#DBEAFE"}
                    bg={isDark ? "#172554" : "#EFF6FF"}
                    border={colors.border}
                    text={colors.text}
                    sub={colors.icon}
                    onPress={() => setShowQRModal(true)}
                  />
                  <ActionTile
                    icon="keyboard"
                    title="Manual Entry"
                    subtitle="Enter tracking code"
                    accent={GOLD}
                    iconBg={isDark ? "#854D0E" : "#FEF3C7"}
                    bg={isDark ? "#422E08" : "#FEF9E7"}
                    border={colors.border}
                    text={colors.text}
                    sub={colors.icon}
                    onPress={() => setShowManualModal(true)}
                  />
                </>
              )}
              {canManageAccounts(role) && (
                <ActionTile
                  icon="manage-accounts"
                  title="Manage Accounts"
                  subtitle="Create and manage users"
                  accent={isDark ? "#C4B5FD" : "#422780"}
                  iconBg={isDark ? "#3B2F73" : "#DDD1FF"}
                  bg={isDark ? "#2A2150" : "#F3EEFF"}
                  border={colors.border}
                  text={colors.text}
                  sub={colors.icon}
                  onPress={() => router.push("/manage-accounts")}
                />
              )}
            </View>
          )}

          {/* STATISTICS: compact tiles */}
          <View style={styles.tileRow}>
            <StatTile
              icon="description"
              label="Procedures"
              value={stats.procedures}
              accent={isDark ? "#93C5FD" : NAVY}
              bg={colors.background}
              border={colors.border}
              sub={colors.icon}
            />
            <StatTile
              icon="help-outline"
              label="FAQs"
              value={stats.faqs}
              accent={GOLD}
              bg={colors.background}
              border={colors.border}
              sub={colors.icon}
            />
            <StatTile
              icon="assignment"
              label="Requests"
              value={stats.requests}
              accent={isDark ? "#93C5FD" : NAVY}
              bg={colors.background}
              border={colors.border}
              sub={colors.icon}
            />
          </View>

          {/* ACCOUNTS + OFFICE ACTIVITY (Operational Admin) */}
          {role === 2 && stats.accounts && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Accounts</Text>
              <View style={styles.chipGrid}>
                {accountChips.map((c) => (
                  <View
                    key={c.label}
                    style={[styles.accountChip, { backgroundColor: cardBg, borderColor: colors.border }]}
                  >
                    <Text style={[styles.accountValue, { color: isDark ? GOLD : NAVY }]}>
                      {c.value}
                    </Text>
                    <Text style={{ color: colors.icon, fontSize: 12, fontWeight: "600" }}>
                      {c.label}
                    </Text>
                  </View>
                ))}
              </View>

              {(stats.offices ?? []).length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
                    Office Activity
                  </Text>
                  <View style={styles.officeGrid}>
                    {(stats.offices ?? []).map((o: any) => (
                      <View
                        key={o.office_name}
                        style={[
                          styles.officeCard,
                          { borderColor: colors.border, backgroundColor: colors.background },
                          isDesktop && styles.officeCardDesktop,
                        ]}
                      >
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>
                          {o.office_name}
                        </Text>
                        <View style={styles.pillRow}>
                          <View style={[styles.pill, { backgroundColor: isDark ? "#422E08" : "#FEF3C7" }]}>
                            <Text style={[styles.pillText, { color: isDark ? "#FCD34D" : "#92400E" }]}>
                              {o.pending} Pending
                            </Text>
                          </View>
                          <View style={[styles.pill, { backgroundColor: isDark ? "#14532D" : "#DCFCE7" }]}>
                            <Text style={[styles.pillText, { color: isDark ? "#BBF7D0" : "#166534" }]}>
                              {o.approved} Approved
                            </Text>
                          </View>
                          <View style={[styles.pill, { backgroundColor: isDark ? "#3F1D1D" : "#FEE2E2" }]}>
                            <Text style={[styles.pillText, { color: isDark ? "#FCA5A5" : "#991B1B" }]}>
                              {o.rejected} Rejected
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {/* PROCEDURES + FAQ: side by side on desktop, stacked on mobile */}
          <View style={[styles.columns, isDesktop && styles.columnsDesktop]}>
            <View style={styles.column}>{proceduresBlock}</View>
            <View style={styles.column}>{faqBlock}</View>
          </View>
        </View>
      </ScrollView>

      <QRCodeModal visible={showQRModal} onClose={() => setShowQRModal(false)} />

      <ManualCodeModal
        visible={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={async (code) => {
          try {
            const request = await searchRequestByReference(code);
            setShowManualModal(false);
            router.push({
              pathname: "/ActiveRequests",
              params: { roleId: "2", request: JSON.stringify(request) },
            });
          } catch (err) {
            console.log(err);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: { paddingBottom: 40 },

  pageContainer: {
    marginTop: 16,
    width: "95%",
    maxWidth: 1400,
    alignSelf: "center",
  },

  searchWrap: { paddingHorizontal: 16 },

  tileRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  tile: {
    flexGrow: 1,
    flexBasis: 240,
    minWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: { fontSize: 15, fontWeight: "700" },
  statTile: {
    flexGrow: 1,
    flexBasis: 150,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statValue: { fontSize: 26, fontWeight: "800" },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  accountChip: {
    flexGrow: 1,
    flexBasis: 100,
    minWidth: 100,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  accountValue: { fontSize: 22, fontWeight: "800" },

  officeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  officeCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  officeCardDesktop: { width: "32.5%", flexGrow: 1 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "700" },

  columns: { marginTop: 0 },
  columnsDesktop: { flexDirection: "row", alignItems: "flex-start" },
  column: { flex: 1 },
});