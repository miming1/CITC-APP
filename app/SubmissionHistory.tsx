import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, useColorScheme, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Universal Components/Header';
import { Colors } from '../constants/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterOption = 'This Week' | 'This Month' | 'This Year' | 'Custom Date';

// Submission History only ever shows *finalized* documents. Pending / active
// requests live on the "Form Submission Progress" page instead.
type FinalizedStatus = 'Completed' | 'Rejected';

interface Submission {
  id: string;
  formName: string;
  refNo: string;
  date: string;
  status: FinalizedStatus;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
// TODO(Florence): once document-submission logic is pushed, swap this
// hardcoded array for a fetch (see previous version of this file for the
// ENDPOINTS.submissionHistory + getStoredToken() scaffold) that only
// returns Completed/Rejected records — Pending/active ones stay off this
// screen entirely.
const SUBMISSIONS: Submission[] = [
  { id: '1', formName: 'INC Form',               refNo: '35169725031', date: '2026-07-30', status: 'Completed' },
  { id: '2', formName: 'Medical Certificate',    refNo: '40139340587', date: '2026-06-10', status: 'Completed' },
  { id: '3', formName: 'Good Moral Certificate', refNo: '29349018653', date: '2026-07-06', status: 'Rejected' },
];

const FILTER_OPTIONS: FilterOption[] = ['This Week', 'This Month', 'This Year', 'Custom Date'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubmissionHistory() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme       = Colors[colorScheme];

  const [search, setSearch]               = useState('');
  const [activeFilter, setActiveFilter]   = useState<FilterOption>('This Month');
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [customDateModal, setCustomDateModal] = useState(false);
  const [customYear,  setCustomYear]  = useState('');
  const [customMonth, setCustomMonth] = useState('');
  const [customDay,   setCustomDay]   = useState('');
  const [appliedCustomDate, setAppliedCustomDate] = useState('');

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return SUBMISSIONS.filter((s) => {
      const matchesSearch =
        s.formName.toLowerCase().includes(search.toLowerCase()) ||
        s.refNo.includes(search) ||
        s.date.includes(search);

      if (!matchesSearch) return false;

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
  }, [search, activeFilter, appliedCustomDate]);

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

  const filterLabel = activeFilter === 'Custom Date' && appliedCustomDate
    ? `Custom: ${appliedCustomDate}`
    : activeFilter;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>

      <Header title="Submission History" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar — shape matches reusable SearchBar component ── */}
        <View style={[styles.searchRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={[styles.searchIconWrap, { backgroundColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.tint} />
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
              <Ionicons name="close-circle" size={22} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filter Row ── */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => setDropdownOpen((prev) => !prev)}
          >
            <Text style={[styles.filterBtnText, { color: theme.tint }]}>Filter by Date</Text>
            <Text style={[styles.filterBtnText, { color: theme.tint }]}>{dropdownOpen ? '∧' : '∨'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Active Filter Label ── */}
        <Text style={[styles.filterLabel, { color: theme.icon }]}>
          Filtered by: <Text style={[styles.filterLabelBold, { color: theme.tint2 }]}>{filterLabel}</Text>
        </Text>

        {/* ── Table Header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2, color: theme.icon }]}>Form Name</Text>
          <Text style={[styles.tableHeaderText, { flex: 2, color: theme.icon }]}>Ref No.</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5, color: theme.icon }]}>Date</Text>
          <Text style={[styles.tableHeaderText, styles.statusHeaderText, { flex: 1.5, color: theme.icon }]}>Status</Text>
        </View>

        {/* ── Table Rows ── */}
        {filtered.map((item) => (
          <View key={item.id} style={[styles.tableRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.tableCell, { flex: 2, color: theme.text }]}>{item.formName}</Text>
            <Text style={[styles.tableCell, { flex: 2, color: theme.text }]}>{item.refNo}</Text>
            <Text style={[styles.tableCell, { flex: 1.5, color: theme.text }]}>{item.date}</Text>
            <View style={styles.statusCell}>
              <View style={[
                styles.statusBadge,
                item.status === 'Completed' && styles.statusCompleted,
                item.status === 'Rejected'  && styles.statusRejected,
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'Completed' && styles.statusTextCompleted,
                  item.status === 'Rejected'  && styles.statusTextRejected,
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <Text style={[styles.empty, { color: theme.icon }]}>No submissions found.</Text>
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
                  { color: theme.icon },
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
        {/* Only THIS outer Pressable closes the modal. The card below stops
            the press from bubbling up, so tapping any input inside it
            (or anywhere on the card) no longer dismisses the modal. */}
        <Pressable style={styles.modalOverlay} onPress={() => setCustomDateModal(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.background }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: theme.tint }]}>Enter Custom Date</Text>
            <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { flex: 1.3, color: theme.tint, borderBottomColor: theme.tint }]}
                placeholder="YYYY" placeholderTextColor={theme.icon}
                value={customYear} onChangeText={setCustomYear}
                keyboardType="numeric" maxLength={4}
              />
              <Text style={[styles.dateSep, { color: theme.tint }]}>/</Text>
              <TextInput
                style={[styles.dateInput, { flex: 1, color: theme.tint, borderBottomColor: theme.tint }]}
                placeholder="MM" placeholderTextColor={theme.icon}
                value={customMonth} onChangeText={setCustomMonth}
                keyboardType="numeric" maxLength={2}
              />
              <Text style={[styles.dateSep, { color: theme.tint }]}>/</Text>
              <TextInput
                style={[styles.dateInput, { flex: 1, color: theme.tint, borderBottomColor: theme.tint }]}
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
      </Modal>

      {/* ── Back to Home Button ── */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.tint }]} onPress={() => router.replace('/UserDashboard')}>
          <Text style={styles.backBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

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

  // ── Search Bar — same shape as reusable SearchBar component ─────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 12,
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

  // ── Filter ─────────────────────────────────────────────────────────────────
  filterRow:     { alignItems: 'flex-end', marginBottom: 4 },
  filterBtn:     { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
  filterBtnText: { fontSize: 13, fontWeight: '500' },
  filterLabel:   { fontSize: 13, marginBottom: 10 },
  filterLabelBold: { fontWeight: '700' },

  // ── Dropdown ───────────────────────────────────────────────────────────────
  dropdownOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
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
  dropdownText:      { fontSize: 13 },

  // ── Table ──────────────────────────────────────────────────────────────────
  tableHeader:     { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 12, marginBottom: 4 },
  tableHeaderText: { fontSize: 12, fontWeight: '600' },
  // Status column content is centered (badge), so its header label is
  // centered too, instead of the default left alignment.
  statusHeaderText: { textAlign: 'center' },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 12, marginBottom: 10,
  },
  tableCell: { fontSize: 12 },

  // ── Status Badge — semantic colors, kept independent of the theme ──────────
  statusCell:          { flex: 1.5, alignItems: 'center', justifyContent: 'center' },
  statusBadge:         { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusCompleted:     { backgroundColor: '#d1fae5' },
  statusRejected:      { backgroundColor: '#fee2e2' },
  statusText:          { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  statusTextCompleted: { color: '#065f46' },
  statusTextRejected:  { color: '#991b1b' },

  empty: { textAlign: 'center', marginTop: 30, fontSize: 13 },

  // ── Custom Date Modal ──────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalCard:    { borderRadius: 16, padding: 28, width: '80%', alignItems: 'center', elevation: 8 },
  modalTitle:   { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  modalDivider: { width: '100%', height: 1, marginBottom: 24 },
  dateRow:      { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 28, gap: 6 },
  dateInput:    { flex: 1, borderBottomWidth: 1.5, fontSize: 20, textAlign: 'center', paddingVertical: 4 },
  dateSep:      { fontSize: 20, fontWeight: '300', flexShrink: 0 },
  modalBtn:     { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  backBtn:      { borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  backBtnText:  { color: '#fff', fontSize: 15, fontWeight: '700' },

});