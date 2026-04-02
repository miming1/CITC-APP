import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  { id: '1', formName: 'INC Form',              refNo: '35169725031', date: '2026-06-30', status: 'Completed' },
  { id: '2', formName: 'Medical Certificate',   refNo: '40139340587', date: '2026-06-18', status: 'Completed' },
  { id: '3', formName: 'Good Moral Certificate',refNo: '29349018653', date: '2026-06-06', status: 'Completed' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubmissionHistory() {
  const [search, setSearch]           = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('This Month');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const FILTER_OPTIONS: FilterOption[] = ['This Week', 'This Month', 'This Year', 'Custom Date'];

  // Filter submissions by search text (form name or ref no)
  const filtered = useMemo(() =>
    SUBMISSIONS.filter((s) =>
      s.formName.toLowerCase().includes(search.toLowerCase()) ||
      s.refNo.includes(search)
    ), [search]);

  function selectFilter(option: FilterOption) {
    setActiveFilter(option);
    setDropdownOpen(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submission History</Text>
        <TouchableOpacity style={styles.headerMenu}>
          <Text style={styles.headerMenuText}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar (local — filters this page only) ── */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder=""
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
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

        {/* ── Dropdown ── */}
        {dropdownOpen && (
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
        )}

        {/* ── Active Filter Label ── */}
        <Text style={styles.filterLabel}>
          Filtered by: <Text style={styles.filterLabelBold}>{activeFilter}</Text>
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

      {/* ── Back to Home Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#9B7FD4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerBack: { position: 'absolute', left: 16 },
  headerBackText: { color: '#fff', fontSize: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerMenu: { position: 'absolute', right: 16 },
  headerMenuText: { color: '#fff', fontSize: 20 },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 16,
  },

  // ── Search Bar ─────────────────────────────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE8F7',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E1340' },

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

  // ── Dropdown ───────────────────────────────────────────────────────────────
  dropdown: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2DBF0',
    marginBottom: 8,
    minWidth: 140,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16 },
  dropdownText: { fontSize: 13, color: '#6B6485' },
  dropdownTextActive: { color: '#6B4FA8', fontWeight: '700' },

  // ── Filter Label ───────────────────────────────────────────────────────────
  filterLabel: { fontSize: 13, color: '#6B6485', marginBottom: 10 },
  filterLabelBold: { color: '#6B4FA8', fontWeight: '700' },

  // ── Table ──────────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 12,
    color: '#6B6485',
    fontWeight: '600',
  },
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
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusCompleted:     { backgroundColor: '#d1fae5' },
  statusPending:       { backgroundColor: '#fef9c3' },
  statusRejected:      { backgroundColor: '#fee2e2' },
  statusText:          { fontSize: 11, fontWeight: '600' },
  statusTextCompleted: { color: '#065f46' },
  statusTextPending:   { color: '#92400e' },
  statusTextRejected:  { color: '#991b1b' },

  // ── Empty ──────────────────────────────────────────────────────────────────
  empty: { textAlign: 'center', color: '#aaa', marginTop: 30, fontSize: 13 },

  // ── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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