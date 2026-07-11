import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
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

interface HeaderProps {
  title: string;
  showBack?: boolean;
  roleId?: string | number;
  adminMode?: string;
  /** When true, replaces the title with a personalized greeting (e.g. dashboard page) */
  showGreeting?: boolean;
}

type MenuItem = {
  label: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  studentOnly?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Dashboard",
    route: "/UserDashboard",
    icon: "home-outline",
  },
  {
    label: "Notifications",
    route: "/Notifications",
    icon: "notifications-outline",
    studentOnly: true,
  },
  {
    label: "Processes",
    route: "/ProcedurePage",
    icon: "document-text-outline",
  },
  {
    label: "Frequently Asked Questions",
    route: "/FAQPage",
    icon: "help-circle-outline",
  },
  {
    label: "Form Submission Progress",
    route: "/ActiveRequests",
    icon: "time-outline",
  },
  {
    label: "Submission History",
    route: "/SubmissionHistory",
    icon: "archive-outline",
  },
  {
    label: "Profile",
    route: "/Profile",
    icon: "person-circle-outline",
  },
];

// Rotation of greetings shown to returning (non-new) users.
// "Welcome, {name}!" is reserved for first-time/new users.
const RETURNING_GREETINGS = [
  "Welcome back",
  "Hello",
  "Good to see you",
  "Great to have you back",
];

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

  const isAdmin =
    Number(roleId) === 2 ||
    adminMode === "true";

  const [menuOpen, setMenuOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  // Pick one returning-user greeting per mount so it doesn't change on re-render
  const [greetingIndex] = useState(() =>
    Math.floor(Math.random() * RETURNING_GREETINGS.length)
  );

  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAdmin) return;

    async function checkNotifications() {
      try {
        const token = await getToken();

        const response = await fetch(
          ENDPOINTS.notifications,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        const unread = data.some(
          (item: any) => !item.is_read
        );

        setHasUnreadNotifications(unread);

      } catch (error) {
        console.log(
          "Notification fetch error:",
          error
        );
      }
    }

    checkNotifications();

  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !showGreeting) return;

    async function fetchProfile() {
      try {
        const token = await getToken();

        const response = await fetch(ENDPOINTS.me, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();

        const rawName = String(data.student_name ?? "");
        const idNumber = String(data.id_number ?? "");

        // student_name defaults to id_number right after signup,
        // so that doesn't count as a real name yet
        const hasRealName =
          rawName.trim() !== "" && rawName.trim() !== idNumber.trim();

        const firstName = hasRealName
          ? rawName.trim().split(" ")[0]
          : "";

        setStudentName(firstName);

        const isComplete =
          !!data.id_number &&
          !!data.program &&
          !!data.year_level;

        setIsNewUser(!isComplete);
      } catch (error) {
        console.log("Profile fetch error:", error);
      }
    }

    fetchProfile();
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

  const handleNavigation = (route: string) => {
    setMenuOpen(false);

    const params = {
      roleId: isAdmin ? "2" : "1",
      ...(adminMode
        ? { admin_mode: adminMode }
        : {}),
    };

    router.push({
      pathname: route as any,
      params,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const styles = createStyles(theme);

  // Bound directly to state rather than an Animated value, so the color
  // always matches menuOpen exactly and can never get stuck mid-transition.
  const lineColor = menuOpen ? "#EBA937" : "#FFFFFF";

  const greeting = isNewUser
    ? "Welcome"
    : RETURNING_GREETINGS[greetingIndex];

  const displayTitle = showGreeting
    ? `${greeting}, ${studentName || "User"}!`
    : title;

  return (
    <>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton}/>
        )}
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {displayTitle}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setMenuOpen(prev => !prev)}
          style={styles.menuButton}
        >
          <View style={styles.menuIconWrapper}>
            <View
              style={[styles.menuLineFull, { backgroundColor: lineColor }]}
            />
            <View
              style={[styles.menuLineShort, { backgroundColor: lineColor }]}
            />
            <View
              style={[styles.menuLineFull, { backgroundColor: lineColor }]}
            />
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        transparent
        visible={menuOpen}
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuOpen(false)}
        >
          <Animated.View
            style={[
              styles.dropdown,
              {
                opacity:fadeAnim,
                transform:[
                  {
                    translateY:slideAnim
                  }
                ]
              }
            ]}
          >
            {MENU_ITEMS
            .filter(item =>
              !item.studentOnly || !isAdmin
            )
            .map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color= "#4d57af"
                  />
                  {item.route === "/notifications" &&
                    hasUnreadNotifications && (
                      <View style={styles.notificationDot}/>
                    )}
                </View>
                <Text style={styles.menuText}>
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.icon}
                />
              </TouchableOpacity>
            ))}
            <View style={styles.separator}/>
            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={() => {
                setMenuOpen(false);
                router.replace("/");
              }}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.logoutText}>
                Logout
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (theme: typeof Colors.light) =>
StyleSheet.create({
  container:{
    height:60,
    backgroundColor:theme.tint,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:16,
    shadowColor:"#000",
    shadowOffset:{
      width:0,
      height:2,
    },
    shadowOpacity:0.12,
    shadowRadius:6,
    elevation:6,
  },
  backButton:{
    width:42,
    height:42,
    borderRadius:21,
    justifyContent:"center",
    alignItems:"center",
  },
  title:{
    flex:1,
    textAlign:"center",
    color:"#FFFFFF",
    fontSize:19,
    fontWeight:"700",
    marginHorizontal:12,
  },
  menuButton:{
    width:42,
    height:42,
    borderRadius:21,
    justifyContent:"center",
    alignItems:"center",
  },
  menuIconWrapper:{
    width:20,
    height:16,
    justifyContent:"space-between",
  },
  menuLineFull:{
    width:30,
    height:2.8,
    borderRadius:999,
  },
  menuLineShort:{
    width:20,
    height:2.8,
    borderRadius:999,
    alignSelf:"center",
    marginLeft: 10,
  },
  overlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.20)",
    alignItems:"flex-end",
  },
  dropdown:{
    marginTop:66,
    marginRight:12,
    width:285,
    backgroundColor:theme.background,
    borderRadius:18,
    borderWidth:1,
    borderColor:theme.border,
    overflow:"hidden",
    elevation:12,
  },
  menuItem:{
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:18,
    paddingVertical:15,
  },
  menuIconContainer:{
    width:34,
    alignItems:"center",
    justifyContent:"center",
  },
  notificationDot:{
    position:"absolute",
    right:2,
    top:0,
    width:9,
    height:9,
    borderRadius:5,
    backgroundColor:"#EF4444",
    borderWidth:1,
    borderColor:theme.background,
  },
  menuText:{
    flex:1,
    marginLeft:8,
    fontSize:15,
    fontWeight:"600",
    color:theme.text,
  },
  separator:{
    height:1,
    backgroundColor:theme.border,
    marginHorizontal:14,
  },
  logoutButton:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    margin:14,
    paddingVertical:13,
    borderRadius:14,
    backgroundColor:theme.tint,
  },
  logoutText:{
    marginLeft:8,
    color:"#FFFFFF",
    fontWeight:"700",
    fontSize:15,
  },
});