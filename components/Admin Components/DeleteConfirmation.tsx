import {
  MaterialIcons,
} from "@expo/vector-icons";

import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";


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

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >

      <View style={styles.overlay}>

        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "#111827"
                  : "#FFFFFF",

              borderColor: colors.border,
            },
          ]}
        >


          {/* ICON */}

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "#3F1D1D"
                    : "#FEE2E2",
              },
            ]}
          >

            <MaterialIcons
              name="delete-outline"
              size={34}
              color="#DC2626"
            />

          </View>



          {/* TITLE */}

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: Fonts.rounded,
              },
            ]}
          >
            Delete Item?
          </Text>



          {/* MESSAGE */}

          <Text
            style={[
              styles.message,
              {
                color: colors.icon,
                fontFamily: Fonts.sans,
              },
            ]}
          >
            Are you sure you want to delete this item?
            This action cannot be undone.
          </Text>



          {/* BUTTONS */}

          <View style={styles.buttonContainer}>


            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderColor: colors.border,
                },
              ]}
              onPress={onCancel}
            >

              <Text
                style={[
                  styles.cancelText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Cancel
              </Text>

            </TouchableOpacity>



            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onConfirm}
            >

              <MaterialIcons
                name="delete"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.deleteText}>
                Delete
              </Text>

            </TouchableOpacity>


          </View>


        </View>


      </View>

    </Modal>
  );
}



const styles = StyleSheet.create({

  overlay:{
    flex:1,

    backgroundColor:"rgba(0,0,0,0.45)",

    justifyContent:"center",
    alignItems:"center",

    padding:24,
  },


  modalContainer:{
    width:"50%",

    borderWidth:1,

    borderRadius:24,

    padding:26,

    alignItems:"center",

    elevation:5,

    shadowColor:"#000",
    shadowOpacity:0.15,
    shadowRadius:12,
    shadowOffset:{
      width:0,
      height:5,
    },
  },


  iconContainer:{
    width:70,
    height:70,

    borderRadius:35,

    justifyContent:"center",
    alignItems:"center",

    marginBottom:16,
  },


  title:{
    fontSize:22,

    fontWeight:"700",

    marginBottom:10,

    textAlign:"center",
  },


  message:{
    fontSize:15,

    lineHeight:22,

    textAlign:"center",

    marginBottom:26,
  },


  buttonContainer:{
    flexDirection:"row",

    width:"100%",

    justifyContent:"center",

    gap:12,
  },


  cancelButton:{
    flex:1,

    borderWidth:1,

    borderRadius:14,

    paddingVertical:12,

    alignItems:"center",
  },


  deleteButton:{
    flex:1,

    backgroundColor:"#DC2626",

    borderRadius:14,

    paddingVertical:12,

    flexDirection:"row",

    justifyContent:"center",

    alignItems:"center",

    gap:6,
  },


  cancelText:{
    fontSize:15,

    fontWeight:"700",
  },


  deleteText:{
    color:"#FFFFFF",

    fontSize:15,

    fontWeight:"700",
  },

});