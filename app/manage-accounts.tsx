import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Universal Components/Header";
import { ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getToken } from "../lib/auth";

// UI mirror of the backend rule (backend is what enforces it)
// 2 Operational, 3 Dean, 4 Chairperson, 5 Faculty, 6 Staff
const CAN_CREATE: Record<number, number[]> = {
  2: [3],
  3: [4],
  4: [5, 6],
};

const LABELS: Record<number, string> = {
  2: "Operational Admin",
  3: "Dean",
  4: "Chairperson",
  5: "Staff",
  6: "Faculty",
};

type Office = { office_id: number; office_name: string };
type Account = {
  id_number: number;
  student_name: string | null;
  email: string | null;
  role_id: number;
  office_name: string | null;
};

function Chips({
  options,
  value,
  onSelect,
  textColor,
}: {
  options: { label: string; value: string }[];
  value: string;
  onSelect: (v: string) => void;
  textColor: string;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onSelect(o.value)}
            style={[
              styles.chip,
              active && { backgroundColor: "#EBA937", borderColor: "#EBA937" },
            ]}
          >
            <Text style={{ color: active ? "#fff" : textColor, fontSize: 13, fontWeight: "600" }}>
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ManageAccounts() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const isLarge = width >= 768;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState<number[]>([]);
  const [myRole, setMyRole] = useState<number | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [newRole, setNewRole] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [officeId, setOfficeId] = useState("");

  async function authHeaders() {
    const token = await getToken();
    if (!token) throw new Error("Please log in again.");
    return {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    };
  }

  async function loadAccounts(headers: Record<string, string>) {
    const res = await fetch(ENDPOINTS.accounts, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load accounts.");
    setAccounts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    async function load() {
      try {
        const headers = await authHeaders();

        const meRes = await fetch(ENDPOINTS.me, { headers });
        const me = await meRes.json();
        if (!meRes.ok) throw new Error(me.error || "Failed to load profile.");
        setMyRole(me.role_id);

        const list = CAN_CREATE[me.role_id] ?? [];
        setAllowed(list);

        if (list.length === 0) return;

        if (list.length === 1) setNewRole(String(list[0]));
        if (me.office_id) setOfficeId(String(me.office_id));

        const offRes = await fetch(ENDPOINTS.offices, { headers });
        const offData = await offRes.json();
        if (!offRes.ok) throw new Error(offData.error || "Failed to load offices.");
        setOffices(Array.isArray(offData) ? offData : []);

        await loadAccounts(headers);
      } catch (e: any) {
        setMessage({ type: "error", text: e.message || "Something went wrong." });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreate() {
    setMessage(null);

    if (!newRole || !idNumber.trim() || !name.trim() || !email.trim() || !password || !officeId) {
      return setMessage({ type: "error", text: "Please fill in all fields." });
    }
    if (!/^\d+$/.test(idNumber) || idNumber.length < 8 || idNumber.length > 20) {
      return setMessage({ type: "error", text: "Invalid ID Number." });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return setMessage({ type: "error", text: "Invalid email format." });
    }
    if (password.length < 8) {
      return setMessage({ type: "error", text: "Password must be at least 8 characters." });
    }

    try {
      setSaving(true);
      const headers = await authHeaders();

      const res = await fetch(ENDPOINTS.createAccount, {
        method: "POST",
        headers,
        body: JSON.stringify({
          role_id: Number(newRole),
          id_number: idNumber.trim(),
          student_name: name.trim(),
          email: email.trim(),
          password,
          office_id: Number(officeId),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        return setMessage({ type: "error", text: data.error || "Failed to create account." });
      }

      setMessage({ type: "success", text: `${LABELS[Number(newRole)]} account created.` });
      setIdNumber("");
      setName("");
      setEmail("");
      setPassword("");
      await loadAccounts(headers);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.icon }];

  const messageBox = message && (
    <View
      style={[
        styles.msg,
        { backgroundColor: message.type === "error" ? "#FDECEA" : "#ECFDF3" },
      ]}
    >
      <Text style={{ color: message.type === "error" ? "#991B1B" : "#065F46", fontSize: 14 }}>
        {message.text}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <Header title="Manage Accounts" />
        <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Header title="Manage Accounts" />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.wrap,
            isLarge && { maxWidth: 500, alignSelf: "center", width: "100%" },
          ]}
        >
          {allowed.length === 0 ? (
            <>
              <Text style={[styles.empty, { color: colors.icon }]}>
                Your account type cannot create other accounts.
              </Text>
              {messageBox}
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
              <Text style={[styles.fixedType, { color: colors.icon }]}>
                Logged in as: {myRole ? LABELS[myRole] : ""}
              </Text>

              {allowed.length > 1 ? (
                <>
                  <Text style={[styles.label, { color: colors.text }]}>Account Type</Text>
                  <Chips
                    options={allowed.map((r) => ({ label: LABELS[r], value: String(r) }))}
                    value={newRole}
                    onSelect={setNewRole}
                    textColor={colors.text}
                  />
                </>
              ) : (
                <Text style={[styles.fixedType, { color: colors.icon }]}>
                  Account type: {LABELS[allowed[0]]} account
                </Text>
              )}

              <Text style={[styles.label, { color: colors.text }]}>ID Number</Text>
              <TextInput
                style={inputStyle}
                value={idNumber}
                onChangeText={setIdNumber}
                keyboardType="numeric"
                placeholder="Enter ID number"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={inputStyle}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Enter email address"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.label, { color: colors.text }]}>Temporary Password</Text>
              <TextInput
                style={inputStyle}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="At least 8 characters"
                placeholderTextColor={colors.icon}
              />

              <Text style={[styles.label, { color: colors.text }]}>Office</Text>
              <Chips
                options={offices.map((o) => ({
                  label: o.office_name,
                  value: String(o.office_id),
                }))}
                value={officeId}
                onSelect={setOfficeId}
                textColor={colors.text}
              />

              <TouchableOpacity
                style={[styles.button, saving && { opacity: 0.7 }]}
                disabled={saving}
                onPress={handleCreate}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {messageBox}

              <Text style={[styles.title, { color: colors.text, marginTop: 28 }]}>
                Accounts
              </Text>

              {accounts.length === 0 ? (
                <Text style={[styles.empty, { color: colors.icon }]}>No accounts yet.</Text>
              ) : (
                accounts.map((a) => (
                  <View key={a.id_number} style={[styles.card, { borderColor: colors.border }]}>
                    <Text style={[styles.cardName, { color: colors.text }]}>
                      {a.student_name || "—"}
                    </Text>
                    <Text style={{ color: colors.icon, fontSize: 13 }}>
                      {LABELS[a.role_id] ?? a.role_id} · {a.id_number}
                    </Text>
                    <Text style={{ color: colors.icon, fontSize: 12 }}>
                      {a.office_name ?? "No office"}
                    </Text>
                  </View>
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 60 },
  wrap: { width: "100%" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 14 },
  fixedType: { fontSize: 14, marginBottom: 14 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 15 },
  chip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  button: {
    backgroundColor: "#EBA937",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  msg: { padding: 10, borderRadius: 8, marginTop: 12, alignItems: "center" },
  empty: { textAlign: "center", marginTop: 12, fontSize: 14 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
});