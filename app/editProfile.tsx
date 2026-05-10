import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import Header from "@/components/Header";
import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getStoredToken } from "../lib/tokenStore";

interface Profile {
  id_number: string;
  email: string;
}

export default function EditProfile() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [form, setForm] = useState<Profile>({
    id_number: "",
    email: "",
  });

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD TOKEN
  // =========================
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getStoredToken();
      setToken(storedToken);
    };

    loadToken();
  }, []);

  // =========================
  // FETCH PROFILE
  // =========================
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      setLoading(true);

      try {
        const res = await fetch(ENDPOINTS.me, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Failed to load profile");
          return;
        }

        setForm({
          id_number: data.id_number ?? "",
          email: data.email ?? "",
        });
      } catch {
        setMessage("Server error while loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // =========================
  // INPUT HANDLER
  // =========================
  const handleChange = (field: keyof Profile, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    if (!token) {
      setMessage("Not authenticated");
      return;
    }

    setSaving(true);
    setMessage("Updating credentials...");

    try {
      const res = await fetch(ENDPOINTS.updateProfile, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          id_number: form.id_number,
          email: form.email,
          password: password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Update failed");
        return;
      }

      setMessage("Profile updated successfully");
      setPassword("");

    } catch {
      setMessage("Server error");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.text }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
    <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.scroll}>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.background },
          ]}
        >

          <Text style={[styles.title, { color: colors.text }]}>
            Edit Profile
          </Text>

          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Update your account information
          </Text>

          {message ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          {/* ID NUMBER */}
          <Text style={[styles.label, { color: colors.text }]}>
            ID Number
          </Text>
          <TextInput
            value={form.id_number}
            onChangeText={(text) => handleChange("id_number", text)}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.icon,
              },
            ]}
          />

          {/* EMAIL */}
          <Text style={[styles.label, { color: colors.text }]}>
            Email
          </Text>
          <TextInput
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.icon,
              },
            ]}
            keyboardType="email-address"
          />

          {/* PASSWORD */}
          <Text style={[styles.label, { color: colors.text }]}>
            New Password{" "}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.icon,
              },
            ]}
            secureTextEntry
            placeholder="Leave empty to keep current password"
            placeholderTextColor={colors.icon}
          />

          {/* BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              saving && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          {/* STATUS TEXT BELOW BUTTON */}
          {saving && (
            <Text style={styles.statusText}>
              Updating credentials...
            </Text>
          )}

        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =========================
// STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    marginTop: 5,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  optional: {
    fontWeight: "400",
    color: "#888",
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },

  statusText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#888",
  },

  messageBox: {
    backgroundColor: "#E8F0FF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },

  messageText: {
    color: "#1D4ED8",
    textAlign: "center",
    fontSize: 13,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});