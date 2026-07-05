import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

import { Colors } from "../constants/theme";

// =========================
// TYPES (MATCH BACKEND)
// =========================

export interface FAQCategory {
  category_id: number;
  category_name: string;
  procedure: number | null; // from backend: "procedure"
  faq_count?: number;
}

export interface Procedure {
  procedure_id: number;
  procedure_name: string;
}

// =========================
// PROPS
// =========================

interface Props {
  procedures: Procedure[];
  categories: FAQCategory[];
  onPressCategory: (category: FAQCategory) => void;
}

// =========================
// COMPONENT
// =========================

export default function AdminQuestionCategories({
  procedures,
  categories,
  onPressCategory,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.heading,
          { color: colors.text },
        ]}
      >
        Question Categories
      </Text>

      {/* =========================
          EMPTY GLOBAL STATE
          ========================= */}
      {categories.length === 0 ? (
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
            No FAQ categories available yet.
          </Text>
        </View>
      ) : (
        <>
          {/* =========================
              GROUP BY PROCEDURE
              ========================= */}
          {procedures.map((procedure) => {
            const filtered = categories.filter(
              (cat) => cat.procedure === procedure.procedure_id
            );

            return (
              <View key={procedure.procedure_id}>

                {/* EMPTY STATE PER PROCEDURE */}
                {filtered.length === 0 ? (
                  <View style={styles.emptyInline}>
                    <Text
                      style={[
                        styles.emptyText,
                        { color: colors.icon },
                      ]}
                    >
                      No FAQs posted yet for this procedure.
                    </Text>
                  </View>
                ) : (
                  filtered.map((category) => (
                    <TouchableOpacity
                      key={category.category_id}
                      activeOpacity={0.85}
                      style={[
                        styles.card,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => onPressCategory(category)}
                    >
                      <Text
                        style={[
                          styles.title,
                          { color: colors.text },
                        ]}
                      >
                        {category.category_name}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingHorizontal: 16,
    marginBottom: 140,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  procedureTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,

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
    fontSize: 15,
    fontWeight: "600",
  },

  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 22,
    alignItems: "center",
  },

  emptyInline: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});