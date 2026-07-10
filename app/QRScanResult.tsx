import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Universal Components/Header";
import { Colors } from "../constants/theme";

export default function TrackedResults() {
  const { reference } = useLocalSearchParams<{
    reference: string;
  }>();

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header title="Document Tracking" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Reference Card */}

        <View
          style={[
            styles.referenceCard,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "#1F2937"
                  : "#F8FAFC",
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialIcons
            name="qr-code"
            size={40}
            color={colors.tint}
          />

          <Text
            style={[
              styles.referenceTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Tracking Reference
          </Text>

          <Text
            style={[
              styles.referenceNumber,
              {
                color: colors.tint2,
              },
            ]}
          >
            {reference ?? "DOC-2026-000001"}
          </Text>
        </View>

        {/* Status */}

        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Current Status
          </Text>

          <View style={styles.statusRow}>
            <MaterialIcons
              name="schedule"
              size={22}
              color="#EBA937"
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: colors.text,
                },
              ]}
            >
              Pending Review
            </Text>
          </View>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.icon,
              },
            ]}
          >
            Your document is currently awaiting review.
          </Text>
        </View>

        {/* Current Office */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Current Office
          </Text>

          <Text
            style={[
              styles.infoText,
              {
                color: colors.icon,
              },
            ]}
          >
            Registrar's Office
          </Text>
        </View>

        {/* Timeline */}

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              marginBottom: 18,
            },
          ]}
        >
          Tracking Timeline
        </Text>

        {[
          {
            title: "Application Submitted",
            office: "Student Portal",
            complete: true,
          },
          {
            title: "Received by Registrar",
            office: "Registrar's Office",
            complete: true,
          },
          {
            title: "Under Review",
            office: "Registrar's Office",
            complete: false,
          },
          {
            title: "Ready for Release",
            office: "Registrar's Office",
            complete: false,
          },
        ].map((step, index) => (
          <View
            key={index}
            style={styles.timelineRow}
          >
            <View
              style={[
                styles.timelineCircle,
                {
                  backgroundColor: step.complete
                    ? colors.tint
                    : "#D1D5DB",
                },
              ]}
            />

            <View
              style={[
                styles.timelineCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.timelineTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {step.title}
              </Text>

              <Text
                style={[
                  styles.timelineSubtitle,
                  {
                    color: colors.icon,
                  },
                ]}
              >
                {step.office}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    padding: 18,
    paddingBottom: 120,
  },

  referenceCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 22,
  },

  referenceTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  referenceNumber: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
  },

  statusCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 26,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusText: {
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 8,
    lineHeight: 20,
    fontSize: 14,
  },

  infoText: {
    fontSize: 15,
    lineHeight: 22,
  },

  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  timelineCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 18,
    marginRight: 14,
  },

  timelineCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },

  timelineTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  timelineSubtitle: {
    marginTop: 4,
    fontSize: 13,
  },
});