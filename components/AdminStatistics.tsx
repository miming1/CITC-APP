import {
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";

import { Colors } from "../constants/theme";

interface Props {
  procedures: number;
  faqs: number;
  requests?: number;
}

export default function AdminStatistics({
  procedures,
  faqs,
  requests,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const cards = [
    {
      label: "Procedures",
      value: procedures,
    },
    {
      label: "FAQs",
      value: faqs,
    },
  ];

  if (requests !== undefined) {
    cards.push({
      label: "Requests",
      value: requests,
    });
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.heading,
          {
            color: colors.text,
          },
        ]}
      >
        Overview
      </Text>

      <View style={styles.grid}>
        {cards.map((item) => (
          <View
            key={item.label}
            style={[
              styles.card,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.value,
                {
                  color: Colors.light.tint,
                },
              ]}
            >
              {item.value}
            </Text>

            <Text
              style={[
                styles.label,
                {
                  color: colors.icon,
                },
              ]}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    paddingHorizontal: 16,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  card: {
    flex: 1,
    minWidth: 110,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: "center",

    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
  },

  value: {
    fontSize: 28,
    fontWeight: "700",
  },

  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
});