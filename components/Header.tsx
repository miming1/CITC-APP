import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal, Pressable,
  StyleSheet, Text, TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/lib/auth-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title: string;
  showBack?: boolean;
  roleId?: string | number;
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { label: 'Processes',                  route: '/process-list'       },
  { label: 'Frequently Asked Questions', route: '/faq'                },
  { label: 'Form Submission Progress',   route: '/active-req'         },
  { label: 'Submission History',         route: '/SubmissionHistory'  },
  { label: 'Profile',                    route: '/editProfile'        },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({ title, showBack = true, roleId: roleIdProp }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user } = useAuth();
  const roleId = roleIdProp ?? user?.roleId;

  const handleNavigate = (route: string) => {
    setMenuOpen(false);

    router.push({
      pathname: route as any,
      params: { roleId: roleId != null ? String(roleId) : '' },
    });
  };

  return (
    <>
      <View style={styles.container}>

        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.sideSlot}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}

        <Text style={styles.title}>{title}</Text>

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
                onPress={() => handleNavigate(item.route)}
              >
                <Text style={styles.dropdownText}>{item.label}</Text>
              </TouchableOpacity>
            ))}

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

const HEADER_COLOR = '#0a1036';
const MENU_ACTIVE_COLOR = '#EBA937';
const Logout_Button = '#0a1036';

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: HEADER_COLOR,
  },
  sideSlot: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 22,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  hamburger: {
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLine: {
    width: 22,
    height: 2.5,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  menuLineActive: {
    backgroundColor: MENU_ACTIVE_COLOR,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
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