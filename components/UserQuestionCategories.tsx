import { MaterialIcons } from "@expo/vector-icons";

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

import { Colors } from "../constants/theme";


// =========================
// TYPES
// =========================

export interface FAQCategory {
  id: string;
  category_name: string;
  procedure_id: string;
}


// =========================
// PROPS
// =========================

interface Props {
  categories: FAQCategory[];
  onPressCategory: (category: FAQCategory) => void;
  onSeeAll?: () => void;
}


// =========================
// COMPONENT
// =========================

export default function UserQuestionCategories({
  categories,
  onPressCategory,
  onSeeAll,
}: Props) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  const visibleCategories = categories.slice(0, 3);



  return (
    <View style={styles.container}>


      {/* HEADER */}

      <View style={styles.header}>

        <Text
          style={[
            styles.heading,
            {
              color: colors.text,
            },
          ]}
        >
          Question Categories
        </Text>


        {categories.length > 3 && onSeeAll && (

          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
          >

            <Text
              style={[
                styles.seeAll,
                {
                  color: colors.tint2,
                },
              ]}
            >
              See All
            </Text>

          </TouchableOpacity>

        )}

      </View>



      {/* EMPTY STATE */}

      {categories.length === 0 ? (

        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor:
                colors.background,

              borderColor:
                colors.border,
            },
          ]}
        >

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.icon,
              },
            ]}
          >
            No FAQ categories available yet.
          </Text>

        </View>


      ) : (

        visibleCategories.map((category) => (

          <TouchableOpacity
            key={category.id}
            activeOpacity={0.85}
            onPress={() =>
              onPressCategory(category)
            }
            style={[
              styles.card,
              {
                backgroundColor:
                  colors.background,

                borderColor:
                  colors.border,
              },
            ]}
          >


            {/* YELLOW ACCENT */}

            <View
              style={[
                styles.accentBar,
                {
                  backgroundColor:
                    "#EBA937",
                },
              ]}
            />



            <View style={styles.content}>

              <Text
                style={[
                  styles.categoryTitle,
                  {
                    color: colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {category.category_name}
              </Text>


              <Text
                style={[
                  styles.subtitle,
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
              size={30}
              color="#EBA937"
            />


          </TouchableOpacity>

        ))

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
    marginBottom: 40,
  },


  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 16,
  },


  heading: {
    fontSize: 20,
    fontWeight: "700",
  },


  seeAll: {
    fontSize: 14,
    fontWeight: "700",
  },


  card: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 16,
    borderWidth: 1,

    padding: 16,
    marginBottom: 12,

    overflow: "hidden",

    elevation: 2,

    shadowColor: "#000",
    shadowOpacity: 0.08,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowRadius: 4,
  },


  accentBar: {
    width: 5,
    height: "100%",

    borderRadius: 10,

    marginRight: 14,
  },


  content: {
    flex: 1,
    paddingRight: 10,
  },


  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",

    marginBottom: 4,
  },


  subtitle: {
    fontSize: 13,
  },


  emptyCard: {
    borderWidth: 1,
    borderRadius: 14,

    padding: 22,

    alignItems: "center",
  },


  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },

});