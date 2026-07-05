import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "../constants/theme";

export interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description?: string;
}

interface Props {
  procedures: Procedure[];
  onPressProcedure: (procedure: Procedure) => void;
}

export default function AssignedProcedures({
  procedures,
  onPressProcedure,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: colors.text }]}>
        Assigned Procedures
      </Text>

      {procedures.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            No procedures assigned to your office.
          </Text>
        </View>
      ) : (
        procedures.map((procedure) => (
          <TouchableOpacity
            key={procedure.procedure_id}
            activeOpacity={0.85}
            style={[
              styles.card,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onPressProcedure(procedure)}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              {procedure.procedure_name}
            </Text>

            <Text
              style={[styles.description, { color: colors.icon }]}
              numberOfLines={2}
            >
              {procedure.description ?? "No description available."}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});