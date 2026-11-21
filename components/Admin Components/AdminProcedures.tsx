import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "../../constants/theme";

export interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description?: string;
  is_mine?: boolean;
}

interface Props {
  procedures: Procedure[];
  onPressProcedure: (procedure: Procedure) => void;
  onSeeAll?: () => void;
  title?: string;
  showHeader?: boolean;
  showSeeAll?: boolean;
  limit?: number;
}

export default function AssignedProcedures({
  procedures,
  onPressProcedure,
  onSeeAll,
  title,
  showHeader = true,
  showSeeAll = true,
  limit = 3,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const displayed = procedures.slice(0, limit);

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.headerRow}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {title ?? "Assigned Procedures"}
          </Text>
          {showSeeAll && procedures.length > 0 && onSeeAll && (
            <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
              <Text style={[styles.seeAll, { color: colors.tint }]}>See All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {procedures.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No procedures available yet.
          </Text>
        </View>
      ) : (
        displayed.map((procedure) => (
          <TouchableOpacity
            key={procedure.procedure_id}
            activeOpacity={0.85}
            style={[
              styles.card,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
            onPress={() => onPressProcedure(procedure)}
          >
            <View style={[styles.accentBar, { backgroundColor: colors.tint }]} />
            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>
                {procedure.procedure_name}
              </Text>
              <Text
                style={[styles.description, { color: colors.icon }]}
                numberOfLines={2}
              >
                {procedure.description ?? "No description available."}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={30} color={colors.tint} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 30, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  heading: { fontSize: 20, fontWeight: "700" },
  seeAll: { fontSize: 14, fontWeight: "700" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  accentBar: { width: 5, height: "100%", borderRadius: 10, marginRight: 14 },
  content: { flex: 1, paddingRight: 10 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  description: { fontSize: 13, lineHeight: 20 },
  emptyCard: { borderWidth: 1, borderRadius: 14, padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
});