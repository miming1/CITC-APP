import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

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
  { id: '1', formName: 'INC Form',               refNo: '35169725031', date: '2026-06-30', status: 'Completed' },
  { id: '2', formName: 'Medical Certificate',    refNo: '40139340587', date: '2026-06-18', status: 'Completed' },
  { id: '3', formName: 'Good Moral Certificate', refNo: '29349018653', date: '2026-06-06', status: 'Completed' },
];

const FILTER_OPTIONS: FilterOption[] = ['This Week', 'This Month', 'This Year', 'Custom Date'];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubmissionHistory() {
  const [search, setSearch]               = useState('');
  const [activeFilter, setActiveFilter]   = useState<FilterOption>('This Month');
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [customDateModal, setCustomDateModal] = useState(false);

  // Custom date input fields
  const [customYear,  setCustomYear]  = useState('');
  const [customMonth, setCustomMonth] = useState('');
  const [customDay,   setCustomDay]   = useState('');

  // Applied custom date for filtering (YYYY-MM-DD)
  const [appliedCustomDate, setAppliedCustomDate] = useState('');

  // ── Filtering logic ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return SUBMISSIONS.filter((s) => {
      // Search filter — matches form name, ref no, or date digits
      const matchesSearch =
        s.formName.toLowerCase().includes(search.toLowerCase()) ||
        s.refNo.includes(search) ||
        s.date.includes(search);

      if (!matchesSearch) return false;

      // Date filter
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
    <SafeAreaView style={styles.safeArea}>

      {/* Reusable Header */}
      <Header title="Submission History" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar — styled like reusable SearchBar ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchIconWrap}>
            <Ionicons name="search" size={18} color="#5D429D" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ref no, or date…"
            placeholderTextColor="#B0A8C8"
            value={search}
            onChangeText={setSearch}
            keyboardType="default"
          />
        </View>

        {/* ── Filter Row ── */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setDropdownOpen((prev) => !prev)}
          >
            <Text style={styles.filterBtnText}>Filter by Date</Text>
            <Text style={styles.filterBtnText}>{dropdownOpen ? '∧' : '∨'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Active Filter Label ── */}
        <Text style={styles.filterLabel}>
          Filtered by: <Text style={styles.filterLabelBold}>{filterLabel}</Text>
        </Text>

        {/* ── Table Header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Form Name</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Ref No.</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Date</Text>
          <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Status</Text>
        </View>

        {/* ── Table Rows ── */}
        {filtered.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.formName}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.refNo}</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.date}</Text>
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
          <Text style={styles.empty}>No submissions found.</Text>
        )}

      </ScrollView>

      {/* ── Dropdown Overlay — floats above content, doesn't push elements ── */}
      {dropdownOpen && (
        <Pressable style={styles.dropdownOverlay} onPress={() => setDropdownOpen(false)}>
          <View style={styles.dropdown}>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => selectFilter(opt)}
              >
                <Text style={[
                  styles.dropdownText,
                  activeFilter === opt && styles.dropdownTextActive,
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
          <View style={styles.modalCard}>

            <Text style={styles.modalTitle}>Enter Custom Date</Text>

            <View style={styles.modalDivider} />

            {/* Date input row: YYYY / MM / DD */}
            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY"
                placeholderTextColor="#B0A8C8"
                value={customYear}
                onChangeText={setCustomYear}
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.dateSep}>/</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="MM"
                placeholderTextColor="#B0A8C8"
                value={customMonth}
                onChangeText={setCustomMonth}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.dateSep}>/</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="DD"
                placeholderTextColor="#B0A8C8"
                value={customDay}
                onChangeText={setCustomDay}
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={applyCustomDate}>
              <Text style={styles.modalBtnText}>Apply</Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Modal>

      {/* ── Back to Home Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/Userdashboard')}>
          <Text style={styles.backBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── SafeArea ───────────────────────────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F3FB',
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 16,
  },

  // ── Search Bar — matches reusable SearchBar style ──────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE8F7',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchIconWrap: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#4b2170',
    paddingVertical: 0,
  },

  // ── Filter ─────────────────────────────────────────────────────────────────
  filterRow: { alignItems: 'flex-end', marginBottom: 4 },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE8F7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
  },
  filterBtnText: { fontSize: 13, color: '#6B4FA8', fontWeight: '500' },

  // ── Filter Label ───────────────────────────────────────────────────────────
  filterLabel: { fontSize: 13, color: '#6B6485', marginBottom: 10 },
  filterLabelBold: { color: '#6B4FA8', fontWeight: '700' },

  // ── Dropdown Overlay — positioned absolute so it floats above content ──────
  dropdownOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    // transparent background — tap outside closes it
  },
  dropdown: {
    position: 'absolute',
    top: 140,   // lines up below the filter button
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2DBF0',
    minWidth: 150,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16 },
  dropdownText: { fontSize: 13, color: '#6B6485' },
  dropdownTextActive: { color: '#6B4FA8', fontWeight: '700' },

  // ── Table ──────────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  tableHeaderText: { fontSize: 12, color: '#6B6485', fontWeight: '600' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tableCell: { fontSize: 12, color: '#1E1340' },

  // ── Status Badge ───────────────────────────────────────────────────────────
  statusBadge:         { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusCompleted:     { backgroundColor: '#d1fae5' },
  statusPending:       { backgroundColor: '#fef9c3' },
  statusRejected:      { backgroundColor: '#fee2e2' },
  statusText:          { fontSize: 11, fontWeight: '600' },
  statusTextCompleted: { color: '#065f46' },
  statusTextPending:   { color: '#92400e' },
  statusTextRejected:  { color: '#991b1b' },

  // ── Empty ──────────────────────────────────────────────────────────────────
  empty: { textAlign: 'center', color: '#aaa', marginTop: 30, fontSize: 13 },

  // ── Custom Date Modal ──────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '80%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B4FA8',
    marginBottom: 12,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2DBF0',
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
  },
  dateInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#9B7FD4',
    fontSize: 20,
    color: '#9B7FD4',
    textAlign: 'center',
    paddingVertical: 4,
    minWidth: 48,
  },
  dateSep: {
    fontSize: 20,
    color: '#9B7FD4',
    fontWeight: '300',
  },
  modalBtn: {
    backgroundColor: '#9B7FD4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
    backgroundColor: '#F5F3FB',
  },
  backBtn: {
    backgroundColor: '#9B7FD4',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

});