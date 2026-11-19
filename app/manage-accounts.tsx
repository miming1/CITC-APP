import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
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
import { API_BASE_URL, ENDPOINTS } from "../constants/api";
import { Colors } from "../constants/theme";
import { getToken } from "../lib/auth";

// UI mirror of the backend rule (the backend is what enforces it)
// 2 Operational -> Dean | 3 Dean -> Chairperson, Staff | 4 Chairperson -> Staff, Faculty
const CAN_CREATE: Record<number, number[]> = {
  2: [3],
  3: [4, 5],
  4: [5, 6],
};

const LABELS: Record<number, string> = {
  1: "Student",
  2: "Operational Admin",
  3: "Dean",
  4: "Chairperson",
  5: "Staff",
  6: "Faculty",
};

// Text colour per role; the badge background is this colour at low opacity
const ROLE_COLORS: Record<number, string> = {
  3: "#7C3AED",
  4: "#2563EB",
  5: "#B7791F",
  6: "#16A34A",
};

const GOLD = "#EBA937";
const PAGE_SIZE = 25;

type Office = { office_id: number; office_name: string };
type Account = {
  user_id: string;
  id_number: number;
  student_name: string | null;
  email: string | null;
  role_id: number;
  office_name: string | null;
  is_active: boolean;
};

type StatusFilter = "all" | "active" | "inactive";

// The backend returns "(no first name yet) (no last name yet)" for accounts
// whose owner hasn't filled in a profile. Show a clean fallback instead.
function cleanName(raw: string | null) {
  return (raw ?? "")
    .replace(/\(no (first|last) name yet\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function Chips({
  options,
  value,
  onSelect,
  textColor,
  borderColor,
  small,
}: {
  options: { label: string; value: string }[];
  value: string;
  onSelect: (v: string) => void;
  textColor: string;
  borderColor: string;
  small?: boolean;
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
              small && styles.chipSmall,
              { borderColor },
              active && { backgroundColor: GOLD, borderColor: GOLD },
            ]}
          >
            <Text
              style={{
                color: active ? "#fff" : textColor,
                fontSize: small ? 12 : 13,
                fontWeight: "600",
              }}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Field({
  label,
  color,
  children,
  style,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {children}
    </View>
  );
}

function OfficeSelect({
  label,
  data,
  value,
  onSelect,
  placeholder,
  colors,
  surface,
  inputBg,
}: {
  label: string;
  data: { label: string; value: string }[];
  value: string;
  onSelect: (v: string) => void;
  placeholder: string;
  colors: typeof Colors.light;
  surface: string;
  inputBg: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = data.find((d) => d.value === value);

  return (
    <Field label={label} color={colors.text}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        style={[
          styles.select,
          { backgroundColor: inputBg, borderColor: open ? GOLD : colors.border },
        ]}
      >
        <MaterialIcons name="business" size={16} color={colors.icon} />
        <Text
          style={{ flex: 1, fontSize: 14, color: selected ? colors.text : colors.icon }}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.icon} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.pickerBackdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.pickerCard, { backgroundColor: surface, borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select office</Text>
            {data.map((o) => {
              const active = o.value === value;
              return (
                <TouchableOpacity
                  key={o.value}
                  activeOpacity={0.7}
                  style={[
                    styles.pickerRow,
                    { borderTopColor: colors.border },
                    active && { backgroundColor: GOLD + "22" },
                  ]}
                  onPress={() => {
                    onSelect(o.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: colors.text,
                      fontWeight: active ? "700" : "500",
                    }}
                  >
                    {o.label}
                  </Text>
                  {active && <MaterialIcons name="check" size={18} color={GOLD} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </Field>
  );
}

function AccountRow({
  a,
  table,
  isDark,
  colors,
  onToggle,
}: {
  a: Account;
  table: boolean;
  isDark: boolean;
  colors: typeof Colors.light;
  onToggle: (a: Account) => void;
}) {
  const name = cleanName(a.student_name);
  const roleColor = ROLE_COLORS[a.role_id] ?? colors.icon;
  const roleLabel = LABELS[a.role_id] ?? String(a.role_id);

  const avatar = (
    <View style={[styles.avatar, { backgroundColor: isDark ? "#3A2C12" : "#FEF3C7" }]}>
      <Text style={{ color: GOLD, fontWeight: "800", fontSize: 13 }}>
        {(name || roleLabel).charAt(0).toUpperCase()}
      </Text>
    </View>
  );

  const nameText = (
    <Text
      style={[
        styles.cardName,
        { color: name ? colors.text : colors.icon },
        !name && { fontStyle: "italic", fontWeight: "500" },
      ]}
      numberOfLines={1}
    >
      {name || "Name not set"}
    </Text>
  );

  const roleBadge = (
    <View style={[styles.roleBadge, { backgroundColor: roleColor + "1F" }]}>
      <Text style={{ color: roleColor, fontSize: 11, fontWeight: "700" }} numberOfLines={1}>
        {roleLabel}
      </Text>
    </View>
  );

  const statusPill = (
    <View
      style={[
        styles.statusPill,
        { backgroundColor: a.is_active ? "#DCFCE7" : "#E5E7EB" },
      ]}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: a.is_active ? "#166534" : "#4B5563",
        }}
      >
        {a.is_active ? "ACTIVE" : "INACTIVE"}
      </Text>
    </View>
  );

  const actionColor = a.is_active ? "#DC2626" : "#16A34A";
  const actionBtn = (
    <TouchableOpacity
      onPress={() => onToggle(a)}
      hitSlop={6}
      style={[styles.actionBtn, { borderColor: actionColor + "66" }]}
    >
      <Text style={{ color: actionColor, fontWeight: "700", fontSize: 12 }}>
        {a.is_active ? "Deactivate" : "Reactivate"}
      </Text>
    </TouchableOpacity>
  );

  if (table) {
    return (
      <View
        style={[
          styles.tableRow,
          { borderBottomColor: colors.border, opacity: a.is_active ? 1 : 0.6 },
        ]}
      >
        <View style={[styles.colName, styles.nameCell]}>
          {avatar}
          <View style={{ flex: 1 }}>
            {nameText}
            <Text style={{ color: colors.icon, fontSize: 12 }} numberOfLines={1}>
              {a.id_number} · {a.email || "no email yet"}
            </Text>
          </View>
        </View>
        <View style={styles.colRole}>{roleBadge}</View>
        <Text style={[styles.colOffice, { color: colors.text }]} numberOfLines={2}>
          {a.office_name ?? "No office"}
        </Text>
        <View style={styles.colAction}>
          {statusPill}
          {actionBtn}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.compactRow,
        { borderColor: colors.border, opacity: a.is_active ? 1 : 0.6 },
      ]}
    >
      {avatar}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.inlineRow}>
          <View style={{ flexShrink: 1 }}>{nameText}</View>
          {roleBadge}
        </View>
        <Text style={{ color: colors.icon, fontSize: 12 }} numberOfLines={1}>
          {a.id_number} · {a.office_name ?? "No office"}
        </Text>
        <Text style={{ color: colors.icon, fontSize: 12 }} numberOfLines={1}>
          {a.email || "no email yet"}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        {statusPill}
        {actionBtn}
      </View>
    </View>
  );
}

export default function ManageAccounts() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";
  const { width } = useWindowDimensions();
  const isLarge = width >= 900; // side-by-side, fixed-height panels
  const useTable = width >= 1100; // list is wide enough for table columns
  const twoColFields = width >= 560;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allowed, setAllowed] = useState<number[]>([]);
  const [myRole, setMyRole] = useState<number | null>(null);
  const [myOfficeId, setMyOfficeId] = useState<number | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [newRole, setNewRole] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [officeId, setOfficeId] = useState("");

  // list controls
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // only used on small screens, where the form is collapsed behind a button
  const [showForm, setShowForm] = useState(false);

  async function authHeaders() {
    const token = await getToken();
    if (!token) throw new Error("Please log in again.");
    return { Authorization: `Token ${token}`, "Content-Type": "application/json" };
  }

  async function loadAccounts(headers: Record<string, string>) {
    const res = await fetch(ENDPOINTS.accounts, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load accounts.");
    setAccounts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    (async () => {
      try {
        const headers = await authHeaders();
        const meRes = await fetch(ENDPOINTS.me, { headers });
        const me = await meRes.json();
        if (!meRes.ok) throw new Error(me.error || "Failed to load profile.");
        setMyRole(me.role_id);
        setMyOfficeId(me.office_id ?? null);

        const list = CAN_CREATE[me.role_id] ?? [];
        setAllowed(list);
        if (list.length === 0) return;
        if (list.length === 1) setNewRole(String(list[0]));

        await loadAccounts(headers);
      } catch (e: any) {
        setMessage({ type: "error", text: e.message || "Something went wrong." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Offices depend on which account type is being created
  useEffect(() => {
    if (!newRole) {
      setOffices([]);
      setOfficeId("");
      return;
    }
    (async () => {
      try {
        const headers = await authHeaders();
        const res = await fetch(`${ENDPOINTS.offices}?role_id=${newRole}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load offices.");
        let list: Office[] = Array.isArray(data) ? data : [];

        // Office is fixed to the creator's own office when a Dean makes Staff,
        // or when a Chairperson makes Staff/Faculty. Only a Dean making a
        // Chairperson (or the Operational Admin making a Dean) picks an office.
        const ownOfficeOnly = myRole === 4 || (myRole === 3 && newRole === "5");
        if (ownOfficeOnly && myOfficeId != null) {
          const own = list.filter((o) => o.office_id === myOfficeId);
          if (own.length > 0) list = own;
        }

        setOffices(list);
        setOfficeId(list.length === 1 ? String(list[0].office_id) : "");
      } catch (e: any) {
        setMessage({ type: "error", text: e.message || "Failed to load offices." });
      }
    })();
  }, [newRole, myRole, myOfficeId]);

  async function handleCreate() {
    setMessage(null);

    if (!newRole || !idNumber.trim() || !name.trim() || !password || !officeId) {
      return setMessage({ type: "error", text: "Please fill in all required fields." });
    }
    if (!/^\d+$/.test(idNumber) || idNumber.length < 8 || idNumber.length > 20) {
      return setMessage({ type: "error", text: "Invalid ID Number." });
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
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
      setShowPassword(false);
      await loadAccounts(headers);
      if (!isLarge) setShowForm(false);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(a: Account) {
    setMessage(null);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/accounts/${a.user_id}/active/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ active: !a.is_active }),
      });
      const data = await res.json();
      if (!res.ok) return setMessage({ type: "error", text: data.error || "Failed." });
      await loadAccounts(headers);
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed." });
    }
  }

  const surface = isDark ? "#1F2937" : "#FFFFFF";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC";
  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: inputBg },
  ];

  const messageBox = message && (
    <View
      style={[
        styles.msg,
        { backgroundColor: message.type === "error" ? "#FDECEA" : "#ECFDF3" },
      ]}
    >
      <MaterialIcons
        name={message.type === "error" ? "error-outline" : "check-circle"}
        size={16}
        color={message.type === "error" ? "#991B1B" : "#065F46"}
      />
      <Text
        style={{
          color: message.type === "error" ? "#991B1B" : "#065F46",
          fontSize: 13,
          fontWeight: "500",
          flex: 1,
        }}
      >
        {message.text}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <Header title="Manage Accounts" adminMode="true" />
        <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  // ── list data ────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = accounts.filter((a) => {
    if (roleFilter !== "all" && String(a.role_id) !== roleFilter) return false;
    if (statusFilter === "active" && !a.is_active) return false;
    if (statusFilter === "inactive" && a.is_active) return false;
    if (!q) return true;
    return (
      cleanName(a.student_name).toLowerCase().includes(q) ||
      String(a.id_number).includes(q) ||
      (a.email ?? "").toLowerCase().includes(q) ||
      (a.office_name ?? "").toLowerCase().includes(q)
    );
  });
  const shown = filtered.slice(0, visibleCount);
  const hasFilters = !!q || roleFilter !== "all" || statusFilter !== "all";

  const rolesPresent = Array.from(new Set(accounts.map((a) => a.role_id))).sort();
  const roleOptions = [
    { label: `All ${accounts.length}`, value: "all" },
    ...rolesPresent.map((r) => ({
      label: `${LABELS[r] ?? r} ${accounts.filter((a) => a.role_id === r).length}`,
      value: String(r),
    })),
  ];
  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: "Any status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  function clearFilters() {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVisibleCount(PAGE_SIZE);
  }

  const formVisible = isLarge || showForm || accounts.length === 0;

  // ── create form ──────────────────────────────────────────────
  const formCard = (
    <View style={[styles.card, { backgroundColor: surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.headerIcon, { backgroundColor: isDark ? "#3A2C12" : "#FEF3C7" }]}>
          <MaterialIcons name="person-add-alt-1" size={22} color={GOLD} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={{ color: colors.icon, fontSize: 12 }}>
            Logged in as {myRole ? LABELS[myRole] : ""}
          </Text>
        </View>
        {!isLarge && accounts.length > 0 && (
          <TouchableOpacity onPress={() => setShowForm(false)} hitSlop={8}>
            <MaterialIcons name="close" size={22} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>

      {allowed.length > 1 ? (
        <Field label="Account Type" color={colors.text}>
          <Chips
            options={allowed.map((r) => ({ label: LABELS[r], value: String(r) }))}
            value={newRole}
            onSelect={setNewRole}
            textColor={colors.text}
            borderColor={colors.border}
          />
        </Field>
      ) : (
        <View style={[styles.infoRow, { backgroundColor: inputBg, borderColor: colors.border }]}>
          <MaterialIcons name="badge" size={16} color={colors.icon} />
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600" }}>
            {LABELS[allowed[0]]} account
          </Text>
        </View>
      )}

      <View style={twoColFields ? styles.row : undefined}>
        <Field label="ID Number" color={colors.text} style={twoColFields && styles.half}>
          <TextInput
            style={inputStyle}
            value={idNumber}
            onChangeText={setIdNumber}
            keyboardType="numeric"
            autoComplete="off"
            placeholder="Enter ID number"
            placeholderTextColor={colors.icon}
          />
        </Field>
        <Field label="Full Name" color={colors.text} style={twoColFields && styles.half}>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            autoComplete="off"
            placeholder="Enter full name"
            placeholderTextColor={colors.icon}
          />
        </Field>
      </View>

      <View style={twoColFields ? styles.row : undefined}>
        <Field label="Email (optional)" color={colors.text} style={twoColFields && styles.half}>
          <TextInput
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="off"
            placeholder="Can be added later"
            placeholderTextColor={colors.icon}
          />
        </Field>
        <Field label="Temporary Password" color={colors.text} style={twoColFields && styles.half}>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[inputStyle, { paddingRight: 40 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              placeholderTextColor={colors.icon}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((p) => !p)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"}
                size={20}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>
        </Field>
      </View>

      {/* Office: fixed (auto-assigned) when there is only one choice, otherwise a compact picker */}
      {offices.length === 1 ? (
        <Field label="Office" color={colors.text}>
          <View style={[styles.infoRow, { backgroundColor: inputBg, borderColor: colors.border, marginBottom: 0 }]}>
            <MaterialIcons name="business" size={16} color={colors.icon} />
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: "600", flex: 1 }}>
              {offices[0].office_name}
            </Text>
            <View style={styles.autoTag}>
              <MaterialIcons name="lock-outline" size={12} color={colors.icon} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.icon }}>
                Auto-assigned
              </Text>
            </View>
          </View>
        </Field>
      ) : !newRole ? (
        <Field label="Office" color={colors.text}>
          <View style={[styles.infoRow, { backgroundColor: inputBg, borderColor: colors.border, marginBottom: 0 }]}>
            <Text style={{ color: colors.icon, fontSize: 13 }}>Choose an account type first</Text>
          </View>
        </Field>
      ) : (
        <OfficeSelect
          label="Office"
          data={offices.map((o) => ({
            label: o.office_name,
            value: String(o.office_id),
          }))}
          value={officeId}
          onSelect={setOfficeId}
          placeholder="Select office"
          colors={colors}
          surface={surface}
          inputBg={inputBg}
        />
      )}

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.7 }]}
        disabled={saving}
        onPress={handleCreate}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {messageBox}
    </View>
  );

  // ── accounts list ────────────────────────────────────────────
  const rows = (
    <>
      {shown.map((a) => (
        <AccountRow
          key={a.user_id}
          a={a}
          table={useTable}
          isDark={isDark}
          colors={colors}
          onToggle={toggleActive}
        />
      ))}

      {accounts.length === 0 && (
        <Text style={[styles.empty, { color: colors.icon }]}>
          No accounts yet. Create the first one using the form.
        </Text>
      )}

      {accounts.length > 0 && filtered.length === 0 && (
        <View style={{ alignItems: "center", paddingVertical: 24, gap: 8 }}>
          <Text style={{ color: colors.icon, fontSize: 14 }}>No accounts match your filters.</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={{ color: colors.tint2, fontWeight: "700", fontSize: 13 }}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {filtered.length > shown.length && (
        <TouchableOpacity
          style={[styles.moreBtn, { borderColor: colors.border }]}
          onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>
            Show more ({filtered.length - shown.length} remaining)
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  const listCard = (
    <View
      style={[
        styles.card,
        styles.listCard,
        isLarge && { flex: 1, minHeight: 0 },
        { backgroundColor: surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.cardHeader, { marginBottom: 12 }]}>
        <View style={[styles.headerIcon, { backgroundColor: isDark ? "#172554" : "#DBEAFE" }]}>
          <MaterialIcons name="groups" size={22} color={colors.tint} />
        </View>
        <Text style={[styles.title, { color: colors.text, flex: 1 }]}>Accounts</Text>
        <View style={[styles.countBadge, { backgroundColor: isDark ? "#334155" : "#EEF2FF" }]}>
          <Text style={{ color: colors.text, fontSize: 12, fontWeight: "700" }}>
            {hasFilters ? `${filtered.length} of ${accounts.length}` : accounts.length}
          </Text>
        </View>
        {!isLarge && !formVisible && (
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowForm(true)}>
            <MaterialIcons name="add" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Toolbar: search + filters */}
      {accounts.length > 0 && (
        <View style={styles.toolbar}>
          <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor: colors.border }]}>
            <MaterialIcons name="search" size={18} color={colors.icon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={search}
              onChangeText={(t) => {
                setSearch(t);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="Search name, ID, email or office"
              placeholderTextColor={colors.icon}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
                <MaterialIcons name="close" size={18} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterRow}>
            <Chips
              small
              options={roleOptions}
              value={roleFilter}
              onSelect={(v) => {
                setRoleFilter(v);
                setVisibleCount(PAGE_SIZE);
              }}
              textColor={colors.text}
              borderColor={colors.border}
            />
            <Chips
              small
              options={statusOptions}
              value={statusFilter}
              onSelect={(v) => {
                setStatusFilter(v as StatusFilter);
                setVisibleCount(PAGE_SIZE);
              }}
              textColor={colors.text}
              borderColor={colors.border}
            />
          </View>
        </View>
      )}

      {/* Table header (wide screens only) */}
      {useTable && accounts.length > 0 && (
        <View style={[styles.tableHead, { borderBottomColor: colors.border }]}>
          <Text style={[styles.th, styles.colName, { color: colors.icon }]}>Name</Text>
          <Text style={[styles.th, styles.colRole, { color: colors.icon }]}>Role</Text>
          <Text style={[styles.th, styles.colOffice, { color: colors.icon }]}>Office</Text>
          <Text style={[styles.th, styles.colAction, { color: colors.icon, textAlign: "right" }]}>
            Status
          </Text>
        </View>
      )}

      {/* On large screens this scrolls inside the card, so the form never leaves the screen */}
      {isLarge ? (
        <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator>
          {rows}
        </ScrollView>
      ) : (
        <View>{rows}</View>
      )}
    </View>
  );

  // ── layout ───────────────────────────────────────────────────
  if (allowed.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <Header title="Manage Accounts" adminMode="true" />
        <View style={styles.wrapSmall}>
          <View style={[styles.card, { backgroundColor: surface, borderColor: colors.border }]}>
            <Text style={[styles.empty, { color: colors.icon }]}>
              Your account type cannot create other accounts.
            </Text>
            {messageBox}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <Header title="Manage Accounts" adminMode="true" />

      {isLarge ? (
        // Two fixed panels filling the screen: form on the left (scrolls only if the
        // window is very short), account list on the right with its own scroll.
        <View style={styles.pageLarge}>
          <ScrollView style={styles.formCol} keyboardShouldPersistTaps="handled">
            {formCard}
          </ScrollView>
          <View style={styles.listCol}>{listCard}</View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.wrapSmall}>
            {formVisible && formCard}
            {listCard}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 12, paddingBottom: 40 },
  wrapSmall: { width: "100%", maxWidth: 700, alignSelf: "center", gap: 12, padding: 12 },

  // large layout: fills everything under the header
  pageLarge: {
    flex: 1,
    minHeight: 0,
    flexDirection: "row",
    gap: 16,
    padding: 16,
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
  },
  formCol: { width: 420, flexGrow: 0, flexShrink: 0 },
  listCol: { flex: 1, minWidth: 0 },

  card: { borderWidth: 1, borderRadius: 16, padding: 16 },
  listCard: { padding: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 17, fontWeight: "700" },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 10 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14 },

  passwordWrap: { position: "relative", justifyContent: "center" },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderWidth: 1, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 },
  chipSmall: { paddingVertical: 4, paddingHorizontal: 10 },

  button: {
    backgroundColor: GOLD,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  msg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  empty: { textAlign: "center", paddingVertical: 16, fontSize: 14 },

  // toolbar
  toolbar: { gap: 8, marginBottom: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },

  // table (wide)
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  th: { fontSize: 12, fontWeight: "600" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colName: { flex: 2.4, minWidth: 0 },
  colRole: { flex: 1.1, alignItems: "flex-start" },
  colOffice: { flex: 1.8, fontSize: 13 },
  colAction: {
    width: 190,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  nameCell: { flexDirection: "row", alignItems: "center", gap: 10 },

  // compact (narrow)
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 8 },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 14, fontWeight: "700" },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  autoTag: { flexDirection: "row", alignItems: "center", gap: 3 },

  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pickerCard: {
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  pickerTitle: { fontSize: 15, fontWeight: "700", padding: 14 },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  moreBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
});