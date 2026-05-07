import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AdminMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export default function AdminMenu({ onEdit, onDelete }: AdminMenuProps) {
  return (
    <View style={styles.menu}>
      <TouchableOpacity onPress={onEdit}>
        <Text style={styles.item}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Text style={[styles.item, { color: "red" }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    right: 16,
    top: 50,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
  item: {
    paddingVertical: 8,
  },
});