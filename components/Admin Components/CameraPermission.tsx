import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
} from "react-native";

export default function CameraModal({ visible, onClose, onCapture }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  if (!permission) return null;

  const takePicture = async () => {
    const result = await cameraRef.current.takePictureAsync();
    setPhoto(result.uri);
  };

  const handleRetake = () => setPhoto(null);

  const handleConfirm = () => {
    onCapture(photo);
    setPhoto(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={!permission.granted}>
      
      {/* 🔐 PERMISSION MODAL */}
      {!permission.granted ? (
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <View style={styles.permissionContent}>
              <MaterialIcons name="camera-alt" size={48} color="#9B7FD4" />

              <Text style={styles.permissionTitle}>
                Allow app to access your camera?
              </Text>

              <TouchableOpacity
                style={styles.permissionBtn}
                onPress={requestPermission}
              >
                <Text style={styles.permissionBtnText}>Allow</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.permissionBtnOutline}
                onPress={onClose}
              >
                <Text style={styles.permissionBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* 📸 FULLSCREEN CAMERA */
        <View style={styles.container}>
          {!photo ? (
            <CameraView style={styles.camera} ref={cameraRef}>
              
              {/* Close */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>

              {/* Capture */}
              <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                <MaterialIcons name="camera" size={32} color="white" />
              </TouchableOpacity>
            </CameraView>
          ) : (
            /* 🖼 PREVIEW */
            <View style={styles.previewContainer}>
              <Image source={{ uri: photo }} style={styles.preview} />

              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleRetake}>
                  <MaterialIcons name="close" size={30} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleConfirm}>
                  <MaterialIcons name="check" size={30} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  /* 🔐 PERMISSION MODAL */
  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContainer: {
    width: "85%",
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 20,
  },

  permissionContent: {
    alignItems: "center",
  },

  permissionTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
    color: "#1a1a1a",
  },

  permissionBtn: {
    backgroundColor: "#DDD6F3",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  permissionBtnOutline: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  permissionBtnText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#1a1a1a",
  },

  /* 📸 CAMERA */
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  camera: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  captureBtn: {
    backgroundColor: "#00000088",
    padding: 20,
    borderRadius: 50,
    marginBottom: 40,
  },

  closeBtn: {
    position: "absolute",
    top: 50,
    left: 20,
  },

  /* 🖼 PREVIEW */
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  preview: {
    width: "100%",
    height: "80%",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    position: "absolute",
    bottom: 40,
  },

  actionBtn: {
    backgroundColor: "#000000aa",
    padding: 20,
    borderRadius: 50,
  },
});