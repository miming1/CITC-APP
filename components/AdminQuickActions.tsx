import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { Colors } from "../constants/theme";

interface Props {
  onScanQR: () => void;
  onManualEntry: () => void;
}

export default function AdminQuickActions({
  onScanQR,
  onManualEntry,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>

      {/* SCAN QR */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            backgroundColor: colorScheme === "dark"
              ? "#172554"
              : "#EFF6FF",
            borderColor: colors.border,
          },
        ]}
        onPress={onScanQR}
      >

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colorScheme === "dark"
                ? "#1E40AF"
                : "#DBEAFE",
            },
          ]}
        >
          <MaterialIcons
            name="qr-code-scanner"
            size={28}
            color={colors.tint}
          />
        </View>


        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Scan QR
        </Text>


        <Text
          style={[
            styles.subtitle,
            {
              color: colors.icon,
            },
          ]}
        >
          Scan document code
        </Text>

      </TouchableOpacity>



      {/* MANUAL ENTRY */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            backgroundColor: colorScheme === "dark"
              ? "#422E08"
              : "#FEF9E7",
            borderColor: colors.border,
          },
        ]}
        onPress={onManualEntry}
      >

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colorScheme === "dark"
                ? "#854D0E"
                : "#FEF3C7",
            },
          ]}
        >
          <MaterialIcons
            name="keyboard"
            size={28}
            color="#EBA937"
          />
        </View>


        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Manual Entry
        </Text>


        <Text
          style={[
            styles.subtitle,
            {
              color: colors.icon,
            },
          ]}
        >
          Enter tracking code
        </Text>

      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    gap: 12,
    marginTop: 30,
    paddingHorizontal: 16,
  },


  button: {
    flex: 1,

    borderWidth: 1,
    borderRadius: 16,

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


  iconContainer: {
    width: 52,
    height: 52,

    borderRadius: 26,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 10,
  },


  title: {
    fontSize: 15,
    fontWeight: "700",
  },


  subtitle: {
    marginTop: 4,

    fontSize: 12,

    textAlign: "center",
  },

});