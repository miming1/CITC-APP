import {
  MaterialIcons,
} from "@expo/vector-icons";

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

export interface Procedure {
  procedure_id: number;
  procedure_name: string;
  description?: string;
}


// =========================
// PROPS
// =========================

interface Props {
  procedures: Procedure[];
  onPressProcedure: (procedure: Procedure) => void;
  onSeeAll?: () => void;

  showHeader?: boolean;
  showSeeAll?: boolean;
  limit?: number;
}
// =========================
// COMPONENT
// =========================
export default function AssignedProcedures({
  procedures,
  onPressProcedure,
  onSeeAll,
  showHeader = true,
  showSeeAll = true,
  limit = 3,
}: Props) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  const displayedProcedures = procedures.slice(
    0,
    limit
  );


  return (
    <View style={styles.container}>


      {/* HEADER */}
      {showHeader && (
      <View style={styles.headerRow}>

        <Text
          style={[
            styles.heading,
            {
              color: colors.text,
            },
          ]}
        >
          Assigned Procedures
        </Text>


        {showSeeAll &&
        procedures.length > 0 &&
        onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.seeAll,
                {
                  color: colors.tint,
                },
              ]}
            >
              See All
            </Text>
          </TouchableOpacity>
        )}

      </View>
      )}



      {/* EMPTY STATE */}
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

          <Text
            style={[
              styles.emptyText,
              {
                color: colors.icon,
              },
            ]}
          >
            No procedures assigned to your office.
          </Text>

        </View>


      ) : (


        displayedProcedures.map((procedure) => (

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

            onPress={() =>
              onPressProcedure(procedure)
            }
          >


            {/* COLOR ACCENT */}
            <View
              style={[
                styles.accentBar,
                {
                  backgroundColor: colors.tint,
                },
              ]}
            />



            {/* CONTENT */}
            <View style={styles.content}>

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

            </View>



            {/* ARROW */}
            <MaterialIcons
              name="chevron-right"
              size={30}
              color={colors.tint}
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
  },


  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

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

    padding: 18,
    marginBottom: 14,

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