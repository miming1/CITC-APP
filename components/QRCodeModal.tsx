import { Modal, View } from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QRCodeModal({
  visible,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View />
    </Modal>
  );
}