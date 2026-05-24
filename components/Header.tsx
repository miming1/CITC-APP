import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title: string;
  showBack?: boolean;
  userName?: string;
  userRole?: string;
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  { label: 'Processes',                  route: '/process-list',      icon: 'format-list-bulleted'   },
  { label: 'Frequently Asked Questions', route: '/faq',               icon: 'help-circle-outline'    },
  { label: 'Form Submission Progress',   route: '/active-req',        icon: 'progress-check'         },
  { label: 'Submission History',         route: '/SubmissionHistory',  icon: 'history'                },
  { label: 'Profile',                    route: '/editProfile',        icon: 'account-circle-outline' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({
  title,
  showBack = true,
  userName = 'Student',
  userRole = 'University Portal',
}: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Slide-down animation ──────────────────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (menuOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 200,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <View style={styles.container}>

        {/* ── Left: Back Button or Spacer ── */}
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.sideSlot}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.sideSlot} />
        )}

        {/* ── Center: Title ── */}
        <Text style={styles.title}>{title}</Text>

        {/* ── Right: Hamburger ── */}
        <TouchableOpacity
          style={styles.sideSlot}
          onPress={() => setMenuOpen(true)}
          activeOpacity={0.8}
        >
          <View style={styles.hamburger}>
            <View style={[styles.menuLine, menuOpen && styles.menuLineActive]} />
            <View style={[styles.menuLine, styles.menuLineMid, menuOpen && styles.menuLineActive]} />
            <View style={[styles.menuLine, menuOpen && styles.menuLineActive]} />
          </View>
        </TouchableOpacity>

      </View>

      {/* ── Dropdown Menu ── */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Animated.View
            style={[
              styles.dropdown,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* ── User Info Header ── */}
            <View style={styles.userHeader}>
              <View style={styles.avatarCircle}>
                <MaterialCommunityIcons name="account" size={28} color="#fff" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userRole}>{userRole}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* ── Menu Items ── */}
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.dropdownItem,
                  index === MENU_ITEMS.length - 1 && styles.dropdownItemLast,
                ]}
                onPress={() => {
                  closeMenu();
                  router.push(item.route as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrapper}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color="#7B5EA7"
                  />
                </View>
                <Text style={styles.dropdownText}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#C9B8F0" />
              </TouchableOpacity>
            ))}

            <View style={styles.divider} />

            {/* ── Logout ── */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                closeMenu();
                router.replace('/');
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="logout" size={18} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const HEADER_COLOR    = '#D3C1FF';
const ACCENT_COLOR    = '#5D3FD3';
const LOGOUT_COLOR    = '#AE74F8';

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

  sideSlot: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Hamburger ──────────────────────────────────────────────────────────────
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
  menuLineMid: {
    width: 16, // shorter middle line for style
  },
  menuLineActive: {
    backgroundColor: '#5D429D',
  },

  // ── Modal Overlay ──────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'flex-end',
  },

  // ── Dropdown Card ──────────────────────────────────────────────────────────
  dropdown: {
    marginTop: 56,
    marginRight: 8,
    backgroundColor: '#F8F4FF',
    borderRadius: 16,
    minWidth: 240,
    elevation: 16,
    shadowColor: '#5D3FD3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    overflow: 'hidden',
  },

  // ── User Info ──────────────────────────────────────────────────────────────
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#EDE5FF',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ACCENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1340',
  },
  userRole: {
    fontSize: 12,
    color: '#7B5EA7',
    marginTop: 2,
  },

  // ── Divider ────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: '#E2D9F3',
  },

  // ── Menu Items ─────────────────────────────────────────────────────────────
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE5FF',
    gap: 12,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EDE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownText: {
    flex: 1,
    fontSize: 13.5,
    color: '#3a256b',
    fontWeight: '500',
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LOGOUT_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});