import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal, Pressable,
  StyleSheet, Text, TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { label: 'Processes',                  route: '/process-list'       },
  { label: 'Frequently Asked Questions', route: '/faq'                },
  { label: 'Form Submission Progress',   route: '/submission-progress'},
  { label: 'Submission History',         route: '/SubmissionHistory'  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({ title, showBack = true }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View style={styles.container}>

        {/* ── Left: Back Button or Empty Spacer ── */}
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.sideSlot}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}

        {/* ── Center: Dynamic Page Title ── */}
        <Text style={styles.title}>{title}</Text>

        {/* ── Right: Hamburger Menu Button ── */}
        <TouchableOpacity
          style={styles.sideSlot}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.hamburger}>
            <View style={[styles.menuLine, menuOpen && styles.menuLineActive]} />
            <View style={[styles.menuLine, menuOpen && styles.menuLineActive]} />
            <View style={[styles.menuLine, menuOpen && styles.menuLineActive]} />
          </View>
        </TouchableOpacity>

      </View>

      {/* ── Dropdown Menu (Modal overlay) ── */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>

          <View style={styles.dropdown}>

            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push(item.route as any);
                }}
              >
                <Text style={styles.dropdownText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

            {/* ── Logout ── */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                setMenuOpen(false);
                router.replace('/');
              }}
            >
              <Text style={styles.logoutText}>Logout  →</Text>
            </TouchableOpacity>

          </View>

        </Pressable>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const HEADER_COLOR = '#D3C1FF';
const MENU_ACTIVE_COLOR = '#5D429D';
const Logout_Button = '#AE74F8';

const styles = StyleSheet.create({

  // ── Header Bar ─────────────────────────────────────────────────────────────
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: HEADER_COLOR,
  },

  // ── Left / Right slots ─────────────────────────────────────────────────────
  sideSlot: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Back Arrow ─────────────────────────────────────────────────────────────
  backArrow: {
    color: '#fff',
    fontSize: 22,
  },

  // ── Title ──────────────────────────────────────────────────────────────────
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Hamburger Wrapper ──────────────────────────────────────────────────────
  hamburger: {
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hamburger Lines ────────────────────────────────────────────────────────
  menuLine: {
    width: 22,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  menuLineActive: {
    backgroundColor: MENU_ACTIVE_COLOR,
  },

  // ── Modal Overlay ──────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },

  // ── Dropdown Card ──────────────────────────────────────────────────────────
  dropdown: {
    marginTop: 56,
    marginRight: 8,
    backgroundColor: '#F1ECFF',
    borderRadius: 10,
    minWidth: 220,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#C9B8F0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#3a256b',
  },

  // ── Logout Row ─────────────────────────────────────────────────────────────
  logoutBtn: {
    backgroundColor: Logout_Button,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

});