import { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import FAQCard from "../components/FAQCard";
import FloatingButtons from "../components/FloatingButtons";
import Header from "../components/Header";
import StepItem from "../components/StepItem";
import TabSwitcher from "../components/TabSwitcher";
import { Colors } from "../constants/theme";

export default function ProcessScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<"procedure" | "faq">("procedure");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      <Header title="Process" />

      <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={[styles.title, { color: colors.text }]}>
            Medical Certificate Submission
        </Text>

        <Text style={[styles.description, { color: colors.icon }]}>
            Submit you medical certificate to provide official verification of an illness, ensuring the absence is treated as legitimate rather than unexcused..
        </Text>  

        {activeTab === "procedure" && (
          <>
            <Text style={[styles.timeline, { color: colors.icon }]}>Estimated Timeline: 1-3 Days</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Requirements</Text>

            <View style={styles.requirements}>
              <Text style={{ color: colors.text }}>• Medical Certificate</Text>
              <Text style={{ color: colors.text }}>• Letter of Excuse/Absence</Text>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Steps</Text>

            <StepItem number={1} text="Login to HIMS." sub="Link: www.hims.link" />
            <StepItem number={2} text="Get Certificate at Health Center" sub="Building 100, 1st Floor" />
            <StepItem number={3} text="Go to Faculty Office" sub="Building 9, 4th Floor" />

          </>
        )}

        {activeTab === "faq" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Frequently Asked Questions
            </Text>

            <FAQCard
              question="Where do I submit my medical certificate?"
              answer="Submit it to the faculty office."
            />

            <FAQCard
              question="Is there a payment for the medical certificate?"
              answer="There is no payment when getting a medical certificate."
            />

            <FAQCard
              question="How do I get a medical certificate?"
              answer="Visit the health center."
            />
          </>
        )}

      </ScrollView>

      <FloatingButtons activeTab={activeTab}/>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },

  description: {
    marginBottom: 10,
    color: "#555",
  },

  timeline: {
    marginTop: 20,
    color: "#555",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 10,
  },

  requirements: {
    marginBottom: 20,
  },
});