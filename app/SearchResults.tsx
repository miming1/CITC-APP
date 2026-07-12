import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FloatingButtons from "../components/Universal Components/FloatingButtons";
import Header from "../components/Universal Components/Header";
import SearchBar from "../components/Universal Components/SearchBar";

import { Colors } from "../constants/theme";
import { fetchFAQCategories, fetchProcedures } from "../lib/api";

interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description?: string;
}

interface FAQCategory {
  id: string;
  category_name: string;
  procedure_id: string;
}

export default function SearchResults() {
  const { query, roleId } = useLocalSearchParams<{ 
    query: string;
    roleId: string;
  }>();

  const isStudent = roleId === "1";

  const [search, setSearch] = useState(query ?? "");

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const { width } = useWindowDimensions();

  const isDesktop = width >= 1024;

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [procData, categoryData] = await Promise.all([
          fetchProcedures(),
          fetchFAQCategories(),
        ]);

        setProcedures(procData);

        setCategories(
          categoryData.map((item: any) => ({
            id: String(item.category_id),
            category_name: item.category_name,
            procedure_id: String(item.procedure),
          }))
        );
      } catch {
        setError("Failed to load search results.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const q = search.toLowerCase();

  const matchedProcesses = useMemo(
    () =>
      procedures.filter((p) =>
        p.procedure_name.toLowerCase().includes(q)
      ),
    [q, procedures]
  );

  const matchedCategories = useMemo(
    () =>
      categories.filter((c) =>
        c.category_name.toLowerCase().includes(q)
      ),
    [q, categories]
  );

  // Feeds the SearchBar's autosuggest dropdown from data already loaded on
  // this page, matching the behavior added on the Dashboard.
  const suggestionPool = useMemo(
    () => [
      ...procedures.map((p) => p.procedure_name),
      ...categories.map((c) => c.category_name),
    ],
    [procedures, categories]
  );

  const hasResults =
    matchedProcesses.length > 0 ||
    matchedCategories.length > 0;

  // ===========================
  // LOADING
  // ===========================

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Header title="Search Results" />

        <View style={styles.centered}>
          <ActivityIndicator
            size="large"
            color={colors.tint}
          />

          <Text
            style={[
              styles.loadingTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Searching...
          </Text>

          <Text
            style={{
              color: colors.icon,
            }}
          >
            Looking for matching procedures and FAQs.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===========================
  // ERROR
  // ===========================

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Header title="Search Results" />

        <View style={styles.centered}>
          <MaterialIcons
            name="error-outline"
            size={52}
            color="#EF4444"
          />

          <Text
            style={{
              color: colors.text,
              fontWeight: "600",
              marginTop: 12,
            }}
          >
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header title="Search Results" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={true}
      >
        <View
          style={[
            styles.pageContainer,
            isDesktop && styles.desktopContainer,
          ]}
        >
          <View style={styles.searchBarWrap}>
            <SearchBar
              placeholder="Search procedures or FAQs..."
              value={search}
              suggestions={suggestionPool}
              onSearch={(newQuery) => {
                setSearch(newQuery);
                router.setParams({ query: newQuery });
              }}
              onChangeText={setSearch}
              onSelectSuggestion={(item) => {
                setSearch(item);
                router.setParams({ query: item });
              }}
            />
          </View>

          {/* SEARCH SUMMARY */}

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDark
                  ? "#1F2937"
                  : "#F8FAFC",
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.summaryTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Search Results
            </Text>

            <Text
              style={[
                styles.summaryQuery,
                {
                  color: colors.tint2,
                },
              ]}
            >
              "{search}"
            </Text>

            <Text
              style={[
                styles.summaryCount,
                {
                  color: colors.icon,
                },
              ]}
            >
              {matchedProcesses.length} Procedure
              {matchedProcesses.length !== 1 ? "s" : ""}
              {" • "}
              {matchedCategories.length} FAQ Categor{matchedCategories.length === 1 ? "y" : "ies"}
            </Text>
          </View>

          {!hasResults && search.length > 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="search-off"
                size={70}
                color={colors.icon}
              />

              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                No results found
              </Text>

              <Text
                style={[
                  styles.emptySubtitle,
                  {
                    color: colors.icon,
                  },
                ]}
              >
                Try searching with another keyword.
              </Text>
            </View>
          )}

          {/* PROCEDURES */}

          {matchedProcesses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="description"
                  size={22}
                  color={colors.tint}
                />

                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Procedures
                </Text>
              </View>

              {matchedProcesses.map((item) => (
                <TouchableOpacity
                  key={item.procedure_id}
                  style={[
                    styles.processCard,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/ProcedureTab",
                      params: {
                        id: item.procedure_id,
                        roleId: 1,
                      },
                    })
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.processTitle,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {item.procedure_name}
                    </Text>

                    {!!item.description && (
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.processDescription,
                          {
                            color: colors.icon,
                          },
                        ]}
                      >
                        {item.description}
                      </Text>
                    )}
                  </View>

                  <MaterialIcons
                    name="chevron-right"
                    size={28}
                    color={colors.tint}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* FAQ */}

          {matchedCategories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="help-outline"
                  size={22}
                  color={colors.tint2}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  FAQ Categories
                </Text>
              </View>
              {matchedCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.processCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/FAQPage",
                      params: {
                        categoryId: category.id,
                      },
                    })
                  }
                >
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.processTitle,
                        {
                          color: colors.text,
                        },
                      ]}
                    >
                      {category.category_name}
                    </Text>
                    <Text
                      style={[
                        styles.processDescription,
                        {
                          color: colors.icon,
                        },
                      ]}
                    >
                      View FAQs in this category
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={28}
                    color={colors.tint2}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      {isStudent && (
        <FloatingButtons chatbotOnly/>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scroll: {
    paddingBottom: 140,
  },

  pageContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 16,
  },

  searchBarWrap: {
    marginBottom: 8,
  },


  desktopContainer: {
    width: "95%",
    maxWidth: 1600,
    alignSelf: "center",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 6,
  },

  // ==========================
  // SEARCH SUMMARY
  // ==========================

  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    marginTop: 18,
    marginBottom: 40,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  summaryQuery: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
  },

  summaryCount: {
    marginTop: 10,
    fontSize: 14,
  },

  // ==========================
  // SECTION
  // ==========================

  section: {
    marginBottom: 34,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },

  // ==========================
  // PROCEDURE CARD
  // ==========================

  processCard: {
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderRadius: 18,

    padding: 18,

    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  processTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },

  processDescription: {
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 12,
  },

  // ==========================
  // EMPTY STATE
  // ==========================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 70,
    paddingHorizontal: 24,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 18,
  },

  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
});