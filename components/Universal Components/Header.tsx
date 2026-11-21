import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { ENDPOINTS } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { getToken } from "@/lib/auth";
import { useMe } from "@/lib/roles";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  roleId?: string | number;
  adminMode?: string;
  /** Replaces the title with a personalized greeting. Student-side only. */
  showGreeting?: boolean;
}

type MenuItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  roles?: number[]; // if set, only these roles see the item
};

const STUDENT_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", route: "/UserDashboard", icon: "home-outline", description: "Go to your dashboard overview" },
  { label: "Notifications", route: "/Notifications", icon: "notifications-outline", description: "View your notifications" },
  { label: "Processes", route: "/ProcedurePage", icon: "document-text-outline", description: "Browse academic procedures" },
  { label: "Frequently Asked Questions", route: "/FAQPage", icon: "help-circle-outline", description: "Find answers to common questions" },
  { label: "Form Submission Progress", route: "/ActiveRequests", icon: "time-outline", description: "Track requests currently in progress" },
  { label: "Submission History", route: "/SubmissionHistory", icon: "archive-outline", description: "View Approved and rejected submissions" },
  { label: "Profile", route: "/Profile", icon: "person-circle-outline", description: "Manage your account details" },
];

const ADMIN_MENU_ITEMS: MenuItem[] = [
  { label: "Dashboard", route: "/AdminDashboard", icon: "home-outline", description: "Go to your dashboard overview" },
  { label: "Processes", route: "/ProcedurePage", icon: "document-text-outline", description: "View academic procedures" },
  { label: "Frequently Asked Questions", route: "/FAQPage", icon: "help-circle-outline", description: "View frequently asked questions" },
  { label: "Active Submissions", route: "/ActiveRequests", icon: "time-outline", description: "Review documents currently awaiting action" },
  { label: "Transaction History", route: "/AdminTransHis", icon: "archive-outline", description: "View Approved and finalized transactions" },
  { label: "Manage Accounts", route: "/manage-accounts", icon: "people-outline", description: "Create and manage accounts", roles: [2, 3, 4] },
  { label: "Profile", route: "/Profile", icon: "person-circle-outline", description: "Manage your account details" },
];

const RETURNING_GREETINGS = ["Welcome back", "Hello", "Good to see you", "Great to have you back"];

export default function Header({
  title,
  showBack = true,
  roleId,
  adminMode,
  showGreeting = false,
}: HeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  // Any staff-side role (2..6) gets the admin menu
  const isAdmin = Number(roleId) >= 2 || adminMode === "true";

  const me = useMe();
  const myRole: number | undefined = me?.role_id;

  const menuItems = (isAdmin ? ADMIN_MENU_ITEMS : STUDENT_MENU_ITEMS).filter(
    (i) => !i.roles || (myRole !== undefined && i.roles.includes(myRole))
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  const [studentName, setStudentName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [greetingIndex] = useState(() =>
    Math.floor(Math.random() * RETURNING_GREETINGS.length)
  );

  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const checkNotifications = useCallback(async () => {
    if (isAdmin) return;
    try {
      const token = await getToken();
      const response = await fetch(ENDPOINTS.notifications, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setHasUnreadNotifications(data.some((item: any) => !item.is_read));
    } catch (error) {
      console.log("Notification fetch error:", error);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!menuOpen || isAdmin) return;
    checkNotifications();
  }, [menuOpen, isAdmin, checkNotifications]);

  useEffect(() => {
    if (isAdmin || !showGreeting) return;

    (async () => {
      try {
        const token = await getToken();
        const response = await fetch(ENDPOINTS.me, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();

        const first = String(data.first_name ?? "").trim();
        const hasRealName = first !== "" && !first.startsWith("(no first");
        setStudentName(hasRealName ? first.split(" ")[0] : "");

        setIsNewUser(!(data.id_number && data.program && data.year_level));
      } catch (error) {
        console.log("Profile fetch error:", error);
      }
    })();
  }, [isAdmin, showGreeting]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: menuOpen ? 1 : 0,
        duration: menuOpen ? 220 : 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: menuOpen ? 0 : -20,
        duration: menuOpen ? 220 : 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) setHoveredRoute(null);
  }, [menuOpen]);

  const handleNavigation = (route: string) => {
    setMenuOpen(false);
    router.push({
      pathname: route as any,
      params: {
        roleId: isAdmin ? "2" : "1",
        ...(adminMode ? { admin_mode: adminMode } : {}),
      },
    });
  };

  const styles = createStyles(theme);
  const lineColor = menuOpen ? "#EBA937" : "#FFFFFF";

  const greeting = isNewUser ? "Welcome" : RETURNING_GREETINGS[greetingIndex];
  const displayTitle =
    showGreeting && !isAdmin ? `${greeting}, ${studentName || "User"}!` : title;

  return (
    <>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setMenuOpen((prev) => !prev)}
          style={styles.menuButton}
        >
          <View style={styles.menuIconWrapper}>
            <View style={[styles.menuLineFull, { backgroundColor: lineColor }]} />
            <View style={[styles.menuLineShort, { backgroundColor: lineColor }]} />
            <View style={[styles.menuLineFull, { backgroundColor: lineColor }]} />
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={menuOpen}
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Animated.View
            style={[
              styles.dropdown,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {menuItems.map((item) => {
              const isHovered = hoveredRoute === item.route;
              return (
                <Pressable
                  key={item.label}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                  onHoverIn={() => setHoveredRoute(item.route)}
                  onHoverOut={() => setHoveredRoute(null)}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={20} color="#4d57af" />
                    {item.route === "/Notifications" && hasUnreadNotifications && (
                      <View style={styles.notificationDot} />
                    )}
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuText}>{item.label}</Text>
                    {Platform.OS === "web" && isHovered && (
                      <Text style={styles.menuDescription} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.icon} />
                </Pressable>
              );
            })}
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={() => {
                setMenuOpen(false);
                router.replace("/");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      height: 60,
      backgroundColor: theme.tint,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 6,
    },
    backButton: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
    title: { flex: 1, textAlign: "center", color: "#FFFFFF", fontSize: 19, fontWeight: "700", marginHorizontal: 12 },
    menuButton: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
    menuIconWrapper: { width: 20, height: 16, justifyContent: "space-between" },
    menuLineFull: { width: 30, height: 2.8, borderRadius: 999 },
    menuLineShort: { width: 20, height: 2.8, borderRadius: 999, alignSelf: "center", marginLeft: 10 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.20)", alignItems: "flex-end" },
    dropdown: {
      marginTop: 66,
      marginRight: 12,
      width: 285,
      backgroundColor: theme.background,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      elevation: 12,
    },
    menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 15 },
    menuIconContainer: { width: 34, alignItems: "center", justifyContent: "center" },
    notificationDot: {
      position: "absolute",
      right: 2,
      top: 0,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: "#EF4444",
      borderWidth: 1,
      borderColor: theme.background,
    },
    menuTextContainer: { flex: 1, marginLeft: 8, justifyContent: "center" },
    menuText: { fontSize: 15, fontWeight: "600", color: theme.text },
    menuDescription: { fontSize: 11, color: theme.icon, marginTop: 2 },
    separator: { height: 1, backgroundColor: theme.border, marginHorizontal: 14 },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      margin: 14,
      paddingVertical: 13,
      borderRadius: 14,
      backgroundColor: theme.tint,
    },
    logoutText: { marginLeft: 8, color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  });