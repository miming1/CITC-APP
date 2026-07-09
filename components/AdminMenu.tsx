import { MaterialIcons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors } from "../constants/theme";

type AdminMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function AdminMenu({
  onEdit,
  onDelete,
}: AdminMenuProps) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.menu,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >

      {/* EDIT */}
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={onEdit}
      >
        <MaterialIcons
          name="edit"
          size={20}
          color={colors.tint}
        />

        <Text
          style={[
            styles.item,
            {
              color: colors.text,
            },
          ]}
        >
          Edit
        </Text>
      </TouchableOpacity>


      {/* DELETE */}
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={onDelete}
      >
        <MaterialIcons
          name="delete-outline"
          size={20}
          color="#DC2626"
        />

        <Text
          style={[
            styles.item,
            {
              color: "#DC2626",
            },
          ]}
        >
          Delete
        </Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    right: 0,
    top: 32,
    width: 150,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    zIndex: 50,
  },

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },

  item: {
    fontSize: 15,
    fontWeight: "600",
  },
});