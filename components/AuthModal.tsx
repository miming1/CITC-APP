import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type AuthModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AuthModal({
  visible,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [password, setPassword] = useState("");

  const handleVerify = () => {
    if (password === "admin123") {
      onSuccess();
      onClose();
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Modal visible={visible} transparent>
      <View style={{ flex:1, justifyContent:"center", backgroundColor:"rgba(0,0,0,0.5)" }}>
        <View style={{ margin:20, padding:20, backgroundColor:"#fff", borderRadius:10 }}>
          <Text>Admin Authentication</Text>

          <TextInput
            secureTextEntry
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            style={{ borderWidth:1, marginVertical:10, padding:8 }}
          />

          <TouchableOpacity onPress={handleVerify}>
            <Text>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}