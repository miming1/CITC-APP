import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, useColorScheme,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActiveRequestModal from '../components/Universal Components/ActiveRequestModal';
import Header from '../components/Universal Components/Header';
import { ENDPOINTS } from '../constants/api';
import { Colors } from '../constants/theme';
import { getStoredToken } from '../lib/tokenStore';
import { rstyles } from "./ActiveRequests";


// ─── Types ────────────────────────────────────────────────────────────────────

type FilterOption = 'This Week' | 'This Month' | 'This Year' | 'Custom Date';

// Submission History only ever shows *finalized* documents. Pending / active
// requests live on the "Form Submission Progress" page instead.
type FinalizedStatus = 'Approved' | 'Rejected';

interface Submission {
  id: string;
  formName: string;
  refNo: string;
  date: string;
  status: FinalizedStatus;
}

const FILTER_OPTIONS: FilterOption[] = ['This Week', 'This Month', 'This Year', 'Custom Date'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubmissionHistory() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const {
    roleId,
    admin_mode,
  } = useLocalSearchParams<{
    roleId?: string;
    admin_mode?: string;
  }>();

  // Custom colors for the Filter button (independent of theme.ts)
  const filterColors = {
    text: isDark ? "#ffffff" : "#141A73",
    arrow: isDark ? "#ffffff" : "#141A73",
  };

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  const [search, setSearch]               = useState('');
  // null = no date filter applied, i.e. "All Submissions" (the default state).
  const [activeFilter, setActiveFilter]   = useState<FilterOption | null>(null);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [customDateModal, setCustomDateModal] = useState(false);
  const [customYear,  setCustomYear]  = useState('');
  const [customMonth, setCustomMonth] = useState('');
  const [customDay,   setCustomDay]   = useState('');
  const [appliedCustomDate, setAppliedCustomDate] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  function openModal(item:any){
    setSelectedItem(item);
    setModalVisible(true);
  }

  function closeModal(){
    setSelectedItem(null);
    setModalVisible(false);
  }


  // Fetch on focus, and reset search + filters back to default whenever the
  // user navigates away, so returning to this screen always starts fresh.
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadSubmissions() {
        try {
          setLoading(true);
          setError(null);

          const token = await getStoredToken();

          const res = await fetch(ENDPOINTS.userSubmissionHistory, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error(`Failed to load submission history (${res.status})`);
          }

          const json = await res.json();

          if (!isActive) return;

          const mapped: Submission[] = json.map((item: any) => ({
            id: String(item.req_doc_id),
            formName: item.document_name ?? item.procedure_name ?? 'Unknown Document',
            refNo: item.reference_code ?? '—',
            date: item.updated_at ? String(item.updated_at).split('T')[0] : '',
            status: (item.status ?? '').toLowerCase() === 'Approved' ? 'Approved' : 'Rejected',
          }));

          setSubmissions(mapped);
        } catch (err: any) {
          if (isActive) setError(err?.message ?? 'Something went wrong.');
        } finally {
          if (isActive) setLoading(false);
        }
      }

      loadSubmissions();

      return () => {
        isActive = false;
        setSearch('');
        setActiveFilter(null);
        setAppliedCustomDate('');
        setCustomYear('');
        setCustomMonth('');
        setCustomDay('');
        setDropdownOpen(false);
        setCustomDateModal(false);
      };
    }, [])
  );

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.formName.toLowerCase().includes(search.toLowerCase()) ||
        s.refNo.includes(search) ||
        s.date.includes(search);

      if (!matchesSearch) return false;

      if (!activeFilter) return true;

      const submissionDate = new Date(s.date);
      const now = new Date();

      if (activeFilter === 'This Week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return submissionDate >= weekAgo;
      }
      if (activeFilter === 'This Month') {
        return (
          submissionDate.getMonth() === now.getMonth() &&
          submissionDate.getFullYear() === now.getFullYear()
        );
      }
      if (activeFilter === 'This Year') {
        return submissionDate.getFullYear() === now.getFullYear();
      }
      if (activeFilter === 'Custom Date' && appliedCustomDate) {
        return s.date === appliedCustomDate;
      }
      return true;
    });
  }, [submissions, search, activeFilter, appliedCustomDate]);

  function selectFilter(option: FilterOption) {
    setDropdownOpen(false);
    if (option === 'Custom Date') {
      setCustomDateModal(true);
    } else {
      setActiveFilter(option);
      setAppliedCustomDate('');
    }
  }

  function applyCustomDate() {
    const formatted = `${customYear}-${customMonth.padStart(2, '0')}-${customDay.padStart(2, '0')}`;
    setAppliedCustomDate(formatted);
    setActiveFilter('Custom Date');
    setCustomDateModal(false);
  }

  function clearFilter() {
    setActiveFilter(null);
    setAppliedCustomDate('');
    setCustomYear('');
    setCustomMonth('');
    setCustomDay('');
  }

  const filterLabel = activeFilter
    ? (activeFilter === 'Custom Date' && appliedCustomDate
        ? `Custom: ${appliedCustomDate}`
        : activeFilter)
    : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>

      <Header
        title="Submission History"
        roleId={roleId as string}
        adminMode={admin_mode as string}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar ── */}
        <View style={[
          styles.searchRow,
          {
            backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
            borderColor: theme.border,
          },
        ]}>
          <View style={[
            styles.searchIconWrap,
            { backgroundColor: isDark ? '#172554' : '#DBEAFE' },
          ]}>
            <Ionicons name="search" size={20} color={isDark ? '#93C5FD' : theme.tint} />
          </View>
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.text },
              Platform.OS === 'web' && ({ outlineStyle: 'none' } as any),
            ]}
            placeholder="Search by name, ref no, or date…"
            placeholderTextColor={theme.icon}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              activeOpacity={0.7}
              style={styles.searchClearBtn}
            >
              <Ionicons name="close-circle" size={22} color={isDark ? '#93C5FD' : theme.icon} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filter Row ── */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => setDropdownOpen((prev) => !prev)}
          >
            <Text style={[styles.filterBtnText, { color: filterColors.text }]}>
              Filter by Date
            </Text>
            <Text style={[styles.filterBtnText, { color: filterColors.arrow }]}>
              {dropdownOpen ? "∧" : "∨"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Active Filter Pill ── */}
        <View style={styles.filterLabelRow}>
          <Text style={[styles.filterLabel, { color: theme.icon }]}>Filtered by:</Text>
          {filterLabel ? (
            <View style={[styles.filterPill, { backgroundColor: theme.border }]}>
              <Text style={[styles.filterPillText, { color: theme.tint2 }]}>{filterLabel}</Text>
              <TouchableOpacity onPress={clearFilter} hitSlop={8} style={styles.filterPillClose}>
                <Ionicons name="close" size={13} color={theme.tint2} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.filterLabelBold, { color: theme.tint2 }]}>All Submissions</Text>
          )}
        </View>

        {/* ── Loading / Error states ── */}
        {loading && (
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <ActivityIndicator color={theme.tint} />
          </View>
        )}

        {!loading && error && (
          <Text style={[styles.empty, { color: '#991b1b' }]}>{error}</Text>
        )}

        {!loading && !error && (
          <>
            {/* ── Table Header ── */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2, color: theme.icon }]}>Form Name</Text>
              <Text style={[styles.tableHeaderText, { flex: 2, color: theme.icon }]}>Ref No.</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5, color: theme.icon }]}>Date</Text>
              <Text style={[styles.tableHeaderText, styles.statusHeaderText, { flex: 1.5, color: theme.icon }]}>Status</Text>
            </View>

            {/* ── Table Rows ── */}
            {filtered.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => openModal(item)}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 2, color: theme.text },
                  ]}
                  numberOfLines={2}
                >
                  {item.formName}
                </Text>

                <Text
                  style={[
                    styles.tableCell,
                    { flex: 2, color: theme.text },
                  ]}
                  numberOfLines={1}
                >
                  {item.refNo}
                </Text>

                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1.5, color: theme.text },
                  ]}
                >
                  {item.date}
                </Text>

                <View style={styles.statusCell}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "Approved" && styles.statusApproved,
                      item.status === "Rejected" && styles.statusRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === "Approved" &&
                          styles.statusTextApproved,
                        item.status === "Rejected" &&
                          styles.statusTextRejected,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {filtered.length === 0 && (
              <Text style={[styles.empty, { color: theme.icon }]}>No submissions found.</Text>
            )}
          </>
        )}

      </ScrollView>

      {/* ── Dropdown Overlay ── */}
      {dropdownOpen && (
        <Pressable style={styles.dropdownOverlay} onPress={() => setDropdownOpen(false)}>
          <View style={[styles.dropdown, { backgroundColor: theme.background, borderColor: theme.border }]}>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => selectFilter(opt)}
              >
                <Text style={[
                  styles.dropdownText,
                  { color: isDark ? "#ffffff" : "#141A73" },
                  activeFilter === opt && { color: theme.tint2, fontWeight: '700' },
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      )}

      {/* ── Custom Date Modal ── */}
      <Modal
        visible={customDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomDateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setCustomDateModal(false)}>
            <Pressable
              style={[styles.modalCard, { backgroundColor: theme.background }]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={[styles.modalTitle, { color: theme.tint }]}>Enter Custom Date</Text>
              <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.dateInput, styles.dateInputYear, { color: theme.tint, borderBottomColor: theme.tint }]}
                  placeholder="YYYY" placeholderTextColor={theme.icon}
                  value={customYear} onChangeText={setCustomYear}
                  keyboardType="numeric" maxLength={4}
                />
                <Text style={[styles.dateSep, { color: theme.tint }]}>/</Text>
                <TextInput
                  style={[styles.dateInput, styles.dateInputShort, { color: theme.tint, borderBottomColor: theme.tint }]}
                  placeholder="MM" placeholderTextColor={theme.icon}
                  value={customMonth} onChangeText={setCustomMonth}
                  keyboardType="numeric" maxLength={2}
                />
                <Text style={[styles.dateSep, { color: theme.tint }]}>/</Text>
                <TextInput
                  style={[styles.dateInput, styles.dateInputShort, { color: theme.tint, borderBottomColor: theme.tint }]}
                  placeholder="DD" placeholderTextColor={theme.icon}
                  value={customDay} onChangeText={setCustomDay}
                  keyboardType="numeric" maxLength={2}
                />
              </View>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.tint }]} onPress={applyCustomDate}>
                <Text style={styles.modalBtnText}>Apply</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <ActiveRequestModal
        modalVisible={modalVisible}
        closeModal={closeModal}
        selectedItem={selectedItem}
        isAdmin={true}
        isHistory={true}
        isMobile={isMobile}
        colors={theme}
        colorScheme={colorScheme}
        styles={rstyles}
        remarks={selectedItem?.remarks ?? ""}
        setRemarks={() => {}}
        remarksFocused={false}
        setRemarksFocused={() => {}}
        selectedStatus={null}
        setSelectedStatus={() => {}}
        handleUpdateStatus={() => {}}
        formatYearLevel={(year)=>{
            return year ? `Year ${year}` : "N/A";
        }}

      />

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 3,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchInput:    { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 0 },
  searchClearBtn: { marginLeft: 8 },
  filterRow:     { alignItems: 'flex-end', marginBottom: 4 },
  filterBtn:     { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
  filterBtnText: { fontSize: 14, fontWeight: '500' },
  filterLabelRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  filterLabel:   { fontSize: 12 },
  filterLabelBold: { fontWeight: '700' },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 4,
    gap: 6,
  },
  filterPillText:  { fontSize: 12, fontWeight: '700' },
  filterPillClose: { padding: 2 },
  dropdownOverlay: { position: 'absolute', top: 38, left: 0, right: 0, bottom: 0 },
  dropdown: {
    position: 'absolute',
    top: 140,
    right: 16,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownItem:      { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownText:      { fontSize: 13, fontWeight: '500' },
  tableHeader:     { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 12, marginBottom: 4 },
  tableHeaderText: { fontSize: 12, fontWeight: '600' },
  statusHeaderText: { textAlign: 'center' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 12, marginBottom: 10,
  },
  tableCell: { fontSize: 12 },
  statusCell:          { flex: 1.5, alignItems: 'center', justifyContent: 'center' },
  statusBadge:         { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusApproved:     { backgroundColor: '#d1fae5' },
  statusRejected:      { backgroundColor: '#fee2e2' },
  statusText:          { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  statusTextApproved: { color: '#065f46' },
  statusTextRejected:  { color: '#991b1b' },
  empty: { textAlign: 'center', marginTop: 30, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalCard:    { borderRadius: 16, padding: 28, width: '80%', maxWidth: 360, alignItems: 'center', elevation: 8 },
  modalTitle:   { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  modalDivider: { width: '100%', height: 1, marginBottom: 24 },
  dateRow:      { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 28, gap: 6 },
  dateInput:    {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    borderBottomWidth: 1.5,
    fontSize: 20,
    textAlign: 'center',
    paddingVertical: 4,
  },
  dateInputYear:  { flexGrow: 1.3 },
  dateInputShort: { flexGrow: 1 },
  dateSep:      { fontSize: 20, fontWeight: '300', flexShrink: 0 },
  modalBtn:     { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
});