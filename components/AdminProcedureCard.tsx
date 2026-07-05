import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
} from "react-native";

import { Colors } from "../constants/theme";

export interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description?: string;
}

interface Props {
  procedure: Procedure;
  onPress: () => void;
}

export default function AdminProcedureCard({
  procedure,
  onPress,
}: Props) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
          },
        ]}
      >
        {procedure.procedure_name}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: colors.icon,
          },
        ]}
        numberOfLines={2}
      >
        {procedure.description ??
          "No description available."}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,

    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
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
});