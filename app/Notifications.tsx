import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Header";
import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getToken } from "../lib/auth";

type Notification = {
  notification_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  request?: number | null;
};

export default function NotificationScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const { roleId } = useLocalSearchParams<{
    roleId?: string;
  }>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      const response = await fetch(
        ENDPOINTS.notifications,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      setNotifications(
        Array.isArray(data)
          ? data
          : data.results ?? []
      );

    } catch (err) {
      console.log("Notification error:", err);
      setError("Unable to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header
        title="Notifications"
        roleId={roleId}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={true}
      >
        <View
          style={[
            styles.container,
            isDesktop && styles.desktopContainer,
          ]}
        >

          {loading && (
            <View style={styles.center}>
              <ActivityIndicator
                size="large"
                color={colors.tint}
              />
            </View>
          )}

          {!loading && error && (
            <Text
              style={[
                styles.empty,
                {
                  color: colors.icon,
                },
              ]}
            >
              {error}
            </Text>
          )}

          {!loading &&
          !error &&
          notifications.length === 0 && (
            <Text
              style={[
                styles.empty,
                {
                  color: colors.icon,
                },
              ]}
            >
              No notifications available.
            </Text>
          )}

          {!loading &&
          !error &&
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.notification_id}
              activeOpacity={0.85}
              style={[
                styles.card,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >

              {!notification.is_read && (
                <View
                  style={[
                    styles.unreadBar,
                    {
                      backgroundColor: "#EBA937",
                    },
                  ]}
                />
              )}

              <View style={styles.content}>
                <Text
                  style={[
                    styles.message,
                    {
                      color: colors.text,
                      fontWeight: notification.is_read
                        ? "400"
                        : "700",
                    },
                  ]}
                >
                  {notification.message}
                </Text>

                <Text
                  style={[
                    styles.date,
                    {
                      color: colors.icon,
                    },
                  ]}
                >
                  {notification.created_at
                    ? new Date(
                        notification.created_at
                      ).toLocaleString()
                    : ""}
                </Text>

              </View>

            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 120,
    paddingTop: 20,
  },

  container: {
    width: "100%",
    paddingHorizontal: 16,
  },

  desktopContainer: {
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },

  center: {
    alignItems: "center",
    paddingVertical: 40,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
  },

  unreadBar: {
    width: 5,
    height: "100%",
    borderRadius: 10,
    marginRight: 14,
  },

  content: {
    flex: 1,
  },

  message: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },

  date: {
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 15,
  },
});