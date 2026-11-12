import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "../../constants/theme";


// ─── Types ────────────────────────────────────────────────────────────────────

interface Process {
  id: string;
  title: string;
}

interface PopularProcessesProps {
  processes: Process[];
  title?: string;
  onPressProcess?: (process: Process) => void;
  onSeeAll?: () => void;
}


// ─── Component ────────────────────────────────────────────────────────────────

export default function PopularProcesses({
  processes,
  title = "Popular Processes",
  onPressProcess,
  onSeeAll,
}: PopularProcessesProps) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  // Dashboard preview only
  const visibleProcesses = processes.slice(0, 3);


  return (
    <View style={styles.container}>


      {/* HEADER */}

      <View style={styles.header}>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>


        {processes.length > 0 && onSeeAll && (

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



      <View style={styles.list}>

        {visibleProcesses.map((item) => (

          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() =>
              onPressProcess?.(item)
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


            {/* ACCENT */}

            <View
              style={[
                styles.accentBar,
                {
                  backgroundColor:
                    colors.tint,
                },
              ]}
            />



            {/* CONTENT */}

            <View style={styles.content}>

              <Text
                numberOfLines={1}
                style={[
                  styles.processTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {item.title}
              </Text>


              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.icon,
                  },
                ]}
              >
                View procedure details
              </Text>

            </View>



            <MaterialIcons
              name="chevron-right"
              size={28}
              color={colors.tint}
            />


          </TouchableOpacity>

        ))}

      </View>


    </View>
  );
}



// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  container: {
    marginTop: 28,
    paddingHorizontal: 16,
  },


  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },


  title: {
    fontSize: 20,
    fontWeight: "700",
  },


  seeAll: {
    fontSize: 14,
    fontWeight: "700",
  },


  list: {
    gap: 12,
  },


  card: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 16,
    borderWidth: 1,

    padding: 16,

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


  processTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },


  subtitle: {
    fontSize: 13,
  },

});