import { Modal, Text, TouchableOpacity, View } from "react-native";

type DeleteModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteModal({
  visible,
  onCancel,
  onConfirm,
}: DeleteModalProps) {
  return (
    <Modal visible={visible} transparent>
      <View style={{ flex:1, justifyContent:"center", backgroundColor:"rgba(0,0,0,0.5)" }}>
        <View style={{ margin:20, padding:20, backgroundColor:"#fff", borderRadius:10 }}>
          <Text>Are you sure you want to delete?</Text>

          <TouchableOpacity onPress={onConfirm}>
            <Text style={{ color:"red" }}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}