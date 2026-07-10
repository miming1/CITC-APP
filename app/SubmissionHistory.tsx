import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, useColorScheme, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Universal Components/Header';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterOption = 'This Week' | 'This Month' | 'This Year' | 'Custom Date';

interface Submission {
  id: string;
  formName: string;
  refNo: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Rejected';
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUBMISSIONS: Submission[] = [
  { id: '1', formName: 'INC Form',               refNo: '35169725031', date: '2026-07-30', status: 'Completed' },
  { id: '2', formName: 'Medical Certificate',    refNo: '40139340587', date: '2026-06-10', status: 'Completed' },
  { id: '3', formName: 'Good Moral Certificate', refNo: '29349018653', date: '2026-07-06', status: 'Pending' },
];

const FILTER_OPTIONS: FilterOption[] = ['This Week', 'This Month', 'This Year', 'Custom Date'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubmissionHistory() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark      = colorScheme === 'dark';

  // Theme shortcuts
  const bg        = isDark ? '#151718' : '#F5F3FB';
  const cardBg    = isDark ? '#1E1E2E' : '#fff';
  const textPri   = isDark ? '#ECEDEE' : '#1E1340';
  const textSec   = isDark ? '#9BA1A6' : '#6B6485';
  const inputBg   = isDark ? '#2A2040' : '#EDE8F7';
  const accent    = '#9B7FD4';
  const accentDark = '#6B4FA8';

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>

      <Header title="Submission History" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar — matches reusable SearchBar style ── */}
        <View style={[styles.searchRow, { backgroundColor: inputBg }]}>
          <View style={styles.searchIconWrap}>
            <Ionicons name="search" size={18} color={isDark ? '#B0A8C8' : '#5D429D'} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#E8E0FF' : '#4b2170' }]}
            placeholder="Search by name, ref no, or date…"
            placeholderTextColor={isDark ? '#6B6485' : '#B0A8C8'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* ── Filter Row ── */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: inputBg }]}
            onPress={() => setDropdownOpen((prev) => !prev)}
          >
            <Text style={[styles.filterBtnText, { color: accentDark }]}>Filter by Date</Text>
            <Text style={[styles.filterBtnText, { color: accentDark }]}>{dropdownOpen ? '∧' : '∨'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Active Filter Label ── */}
        <Text style={[styles.filterLabel, { color: textSec }]}>
          Filtered by: <Text style={[styles.filterLabelBold, { color: accentDark }]}>{filterLabel}</Text>
        </Text>

        {/* ── Table Header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2, color: textSec }]}>Form Name</Text>
          <Text style={[styles.tableHeaderText, { flex: 2, color: textSec }]}>Ref No.</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5, color: textSec }]}>Date</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5, color: textSec }]}>Status</Text>
        </View>

        {/* ── Table Rows ── */}
        {filtered.map((item) => (
          <View key={item.id} style={[styles.tableRow, { backgroundColor: cardBg }]}>
            <Text style={[styles.tableCell, { flex: 2, color: textPri }]}>{item.formName}</Text>
            <Text style={[styles.tableCell, { flex: 2, color: textPri }]}>{item.refNo}</Text>
            <Text style={[styles.tableCell, { flex: 1.5, color: textPri }]}>{item.date}</Text>
            <View style={{ flex: 1.5, alignItems: 'center' }}>
              <View style={[
                styles.statusBadge,
                item.status === 'Completed' && styles.statusCompleted,
                item.status === 'Pending'   && styles.statusPending,
                item.status === 'Rejected'  && styles.statusRejected,
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'Completed' && styles.statusTextCompleted,
                  item.status === 'Pending'   && styles.statusTextPending,
                  item.status === 'Rejected'  && styles.statusTextRejected,
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <Text style={[styles.empty, { color: textSec }]}>No submissions found.</Text>
        )}

      </ScrollView>

      {/* ── Dropdown Overlay ── */}
      {dropdownOpen && (
        <Pressable style={styles.dropdownOverlay} onPress={() => setDropdownOpen(false)}>
          <View style={[styles.dropdown, { backgroundColor: cardBg, borderColor: isDark ? '#2A2040' : '#E2DBF0' }]}>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => selectFilter(opt)}
              >
                <Text style={[
                  styles.dropdownText,
                  { color: textSec },
                  activeFilter === opt && { color: accentDark, fontWeight: '700' },
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
        <Pressable style={styles.modalOverlay} onPress={() => setCustomDateModal(false)}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1E1E2E' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: accent }]}>Enter Custom Date</Text>
            <View style={[styles.modalDivider, { backgroundColor: isDark ? '#2A2040' : '#E2DBF0' }]} />
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.dateInput, { color: accent, borderBottomColor: accent }]}
                placeholder="YYYY" placeholderTextColor="#B0A8C8"
                value={customYear} onChangeText={setCustomYear}
                keyboardType="numeric" maxLength={4}
              />
              <Text style={[styles.dateSep, { color: accent }]}>/</Text>
              <TextInput
                style={[styles.dateInput, { color: accent, borderBottomColor: accent }]}
                placeholder="MM" placeholderTextColor="#B0A8C8"
                value={customMonth} onChangeText={setCustomMonth}
                keyboardType="numeric" maxLength={2}
              />
              <Text style={[styles.dateSep, { color: accent }]}>/</Text>
              <TextInput
                style={[styles.dateInput, { color: accent, borderBottomColor: accent }]}
                placeholder="DD" placeholderTextColor="#B0A8C8"
                value={customDay} onChangeText={setCustomDay}
                keyboardType="numeric" maxLength={2}
              />
            </View>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: accent }]} onPress={applyCustomDate}>
              <Text style={styles.modalBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── Back to Home Button ── */}
      <View style={[styles.footer, { backgroundColor: bg }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: accent }]} onPress={() => router.replace('/UserDashboard')}>
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

  // ── Search Bar ─────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchIconWrap: { marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  searchInput:    { flex: 1, fontSize: 15, paddingVertical: 0 },

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
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingVertical: 14, paddingHorizontal: 12, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  tableCell: { fontSize: 12 },

  // ── Status Badge ───────────────────────────────────────────────────────────
  statusBadge:         { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusCompleted:     { backgroundColor: '#d1fae5' },
  statusPending:       { backgroundColor: '#fef9c3' },
  statusRejected:      { backgroundColor: '#fee2e2' },
  statusText:          { fontSize: 11, fontWeight: '600' },
  statusTextCompleted: { color: '#065f46' },
  statusTextPending:   { color: '#92400e' },
  statusTextRejected:  { color: '#991b1b' },

  empty: { textAlign: 'center', marginTop: 30, fontSize: 13 },

  // ── Custom Date Modal ──────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalCard:    { borderRadius: 16, padding: 28, width: '80%', alignItems: 'center', elevation: 8 },
  modalTitle:   { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  modalDivider: { width: '100%', height: 1, marginBottom: 24 },
  dateRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 6 },
  dateInput:    { borderBottomWidth: 1.5, fontSize: 20, textAlign: 'center', paddingVertical: 4, minWidth: 48 },
  dateSep:      { fontSize: 20, fontWeight: '300' },
  modalBtn:     { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 40 },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  backBtn:      { borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  backBtnText:  { color: '#fff', fontSize: 15, fontWeight: '700' },

});