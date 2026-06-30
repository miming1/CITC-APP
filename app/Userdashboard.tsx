import { useRouter } from 'expo-router';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';

import { useEffect, useState } from 'react';

import { Colors } from "../constants/theme";

import FAQCard from '../components/FAQCard';
import FloatingButtons from '../components/FloatingButtons';
import Header from '../components/Header';
import PopularProcesses from '../components/PopularProcesses';
import SearchBar from '../components/SearchBar';

import { API_BASE_URL } from "../constants/api";

interface HelpCategory {
  id: string;
  label: string;
  processId: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface Process {
  id: string;
  title: string;
}

export default function UserDashboard() {
  const router = useRouter();

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const bg = colors.background;
  const textPri = isDark ? '#ECEDEE' : '#1E1340';

  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  const [helpCategories, setHelpCategories] = useState<HelpCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  // =========================
  // FETCH PROCEDURES
  // =========================
  const fetchProcesses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/procedures/`);
      const data = await res.json();

      const mapped = data.map((item: any) => ({
        id: String(item.procedure_id), // ✅ FIXED
        title: item.procedure_name ?? item.title,
      }));

      setProcesses(mapped);
    } catch (err) {
      console.log("Failed to fetch processes:", err);
    }
  };



  // =========================
  // FAQS
  // =========================
  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/faqs/`);
      const data = await res.json();
      setFaqs(data);
    } catch (err) {
      console.log("Failed to fetch faqs:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);

      await Promise.all([
        fetchProcesses(),
        fetchFaqs(),
      ]);

      setLoading(false);
    };

    loadAll();
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <Header title="Welcome!" showBack={false} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SEARCH */}
        <SearchBar
          placeholder="Search..."
          onSearch={(query) => {
            router.push({
              pathname: '/SearchResults',
              params: { query },
            });
          }}
        />

        

        {/* POPULAR */}
        <PopularProcesses
          processes={processes}
          onPressProcess={(process: Process) =>
            router.push({
              pathname: '/process',
              params: {
                id: process.id, // ✅ FIXED SOURCE NOW MATCHES BACKEND
                roleId: 1,
              },
            })
          }
        />

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPri }]}>
            FAQs
          </Text>

          {faqs.map((item) => (
            <FAQCard
              key={item.id}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </View>
      </ScrollView>

      <FloatingButtons
        activeTab="faq"
        onTrackPress={() => router.push('/track-details')}
        onFAQPress={() => router.push('/faq')}
      />
    </SafeAreaView>
  );
}

// =========================
// STYLES
// =========================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android'
      ? StatusBar.currentHeight
      : 0,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 160,
  },

  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },

  helpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  helpItem: {
    alignItems: 'center',
    flex: 1,
  },

  helpCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },

  helpLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});