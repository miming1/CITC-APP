import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import Dropdown from "@/components/Dropdown";
import Header from "@/components/Header";
import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getStoredToken } from "../lib/tokenStore";

interface Profile {
  id_number: string;
  email: string;
  student_name: string;
  program: string;
  year_level: string;
}

const PROGRAMS = [
  {
    label: "Information Technology",
    value: "Information Technology",
  },
  {
    label: "Technology Communication Management",
    value: "Technology Communication Management",
  },
  {
    label: "Computer Science",
    value: "Computer Science",
  },
  {
    label: "Data Science",
    value: "Data Science",
  },
];

const YEAR_LEVELS = [
  { label: "1st Year", value: "1" },
  { label: "2nd Year", value: "2" },
  { label: "3rd Year", value: "3" },
  { label: "4th Year", value: "4" },
];

export default function EditProfile() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [form, setForm] = useState<Profile>({
    id_number: "",
    email: "",
    student_name: "",
    program: "",
    year_level: "",
  });

  const [roleId, setRoleId] = useState<number | null>(null);

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD TOKEN
  // =========================
  useEffect(() => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setMessage("Please log in again.");
      setLoading(false);
      return;
    }

    setToken(storedToken);
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

        if (res.status === 401) {
          setMessage("Your session has expired. Please log in again.");
          return;
        }

        if (!res.ok) {
          setMessage(data.error || "Failed to load profile");
          return;
        }

        setRoleId(data.role_id);

        setForm({
          id_number: data.id_number ?? "",
          email: data.email ?? "",
          student_name: data.student_name ?? "",
          program: data.program ?? "",
          year_level: data.year_level
            ? String(data.year_level)
            : "",
        });
      } catch (err) {
        console.error(err);
        setMessage("Server error while loading profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // =========================
  // UPDATE FIELD
  // =========================
  const handleChange = (
    field: keyof Profile,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const handleSubmit = async () => {
    if (!token) {
      setMessage("Not authenticated");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(
        ENDPOINTS.updateProfile,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            id_number: form.id_number,
            email: form.email,
            password: password || undefined,
            student_name: form.student_name,
            program: form.program,
            year_level: form.year_level
              ? Number(form.year_level)
              : undefined,
          }),
        }
      );

      const data = await res.json();

      if (res.status === 401) {
        setMessage("Your session has expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        setMessage(data.error || "Update failed");
        return;
      }

      setMessage("Profile updated successfully.");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Server error.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.tint}
        />

        <Text
          style={{
            color: colors.text,
            marginTop: 12,
          }}
        >
          Loading profile...
        </Text>
      </View>
    );
  }

  const isStudent = roleId === 1;

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <Header title="Profile" />

      <ScrollView
        contentContainerStyle={styles.scroll}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            Edit Profile
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: colors.icon },
            ]}
          >
            Update your account information
          </Text>

          {message ? (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                {message}
              </Text>
            </View>
          ) : null}

          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            ID Number
          </Text>

          <TextInput
            value={form.id_number}
            onChangeText={(text) =>
              handleChange(
                "id_number",
                text
              )
            }
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor:
                  colors.icon,
              },
            ]}
          />

          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            Email
          </Text>

          <TextInput
            value={form.email}
            keyboardType="email-address"
            onChangeText={(text) =>
              handleChange("email", text)
            }
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor:
                  colors.icon,
              },
            ]}
          />

          {isStudent && (
            <>
              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                Student Name
              </Text>

              <TextInput
                value={form.student_name}
                onChangeText={(text) =>
                  handleChange(
                    "student_name",
                    text
                  )
                }
                style={[
                  styles.input,
                  {
                    color:
                      colors.text,
                    borderColor:
                      colors.icon,
                  },
                ]}
              />

              <Dropdown
                label="Program"
                data={PROGRAMS}
                value={form.program}
                buttonText="Select Program"
                onSelect={(value) =>
                  handleChange(
                    "program",
                    value
                  )
                }
              />

              <Dropdown
                label="Year Level"
                data={YEAR_LEVELS}
                value={form.year_level}
                buttonText="Select Year Level"
                onSelect={(value) =>
                  handleChange(
                    "year_level",
                    value
                  )
                }
              />
            </>
          )}

          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            New Password{" "}
            <Text style={styles.optional}>
              (optional)
            </Text>
          </Text>

          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Leave empty to keep current password"
            placeholderTextColor={
              colors.icon
            }
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor:
                  colors.icon,
              },
            ]}
          />

          <TouchableOpacity
            style={[
              styles.button,
              saving && {
                opacity: 0.7,
              },
            ]}
            disabled={saving}
            onPress={handleSubmit}
          >
            <Text
              style={styles.buttonText}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    marginTop: 5,
    marginBottom: 20,
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