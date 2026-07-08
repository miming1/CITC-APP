import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { Colors } from "../constants/theme";

interface DocListProps {
  icon: any;
  text: string;
  selected: boolean;
  onPress: () => void;
}

export default function DocList({
  icon,
  text,
  selected,
  onPress,
}: DocListProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* ICON BADGE */}
      <View style={[styles.badge, { backgroundColor: (colors as any).tint2 ?? colors.icon }]}> 
        <MaterialIcons name={icon} size={18} color={colors.background} />
      </View>

      {/* TEXT */}
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
      </View>

      {/* CHECKBOX */}
      <View
        style={[
          styles.checkbox,
          { borderColor: colors.icon },
          selected && {
            backgroundColor: "#EFA810",
            borderColor: "#EFA810",
          },
        ]}
      >
        {selected && (
          <MaterialIcons
            name="check"
            size={14}
            color="#fff"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  text: {
    fontWeight: "600",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
});