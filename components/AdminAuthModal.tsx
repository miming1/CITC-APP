import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { API_BASE_URL } from "../constants/api";
import { Colors } from "../constants/theme";
import { getToken } from "../lib/auth";


interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}


export default function AdminAuthModal({
  visible,
  onClose,
  onSuccess,
}: Props) {


  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  const handleConfirm = async () => {

    if (!password.trim()) {

      setError(
        "Please enter your admin password."
      );

      return;
    }


    try {

      setLoading(true);
      setError("");



      const token = await getToken();


      if (!token) {

        throw new Error(
          "Authentication token missing."
        );

      }



      const response = await fetch(
        `${API_BASE_URL}/verify-password/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Token ${token}`,
          },


          body: JSON.stringify({
            password,
          }),
        }
      );



      const data = await response.json();

      if (!response.ok || !data.valid) {

        throw new Error(
          "Incorrect password."
        );

      }

      // Only continue if password is correct
      await onSuccess();

      setPassword("");
      setError("");

      onClose();



    } catch (err:any) {

      setError(
        err.message ??
        "Authentication failed. Please try again."
      );


    } finally {

      setLoading(false);

    }

  };




  const handleClose = () => {

    if (loading)
      return;


    setPassword("");
    setError("");

    onClose();

  };




  return (

    <Modal

      visible={visible}

      transparent

      animationType="fade"

      onRequestClose={handleClose}

    >

      <View style={styles.overlay}>


        <View

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



          <Text

            style={[
              styles.title,

              {
                color:
                  colors.text,
              },

            ]}

          >

            Admin Verification

          </Text>




          <Text

            style={[
              styles.subtitle,

              {
                color:
                  colors.icon,
              },

            ]}

          >

            Confirm your identity before saving changes to this procedure.

          </Text>




          <View style={styles.inputWrapper}>


            <TextInput

              value={password}

              onChangeText={setPassword}

              placeholder="Enter admin password"

              placeholderTextColor={
                colors.icon
              }


              secureTextEntry={
                !showPassword
              }


              style={[

                styles.input,

                {
                  color:
                    colors.text,

                  borderColor:
                    colors.border,

                  paddingRight:
                    Platform.OS === "web"
                      ? 14
                      : 50,

                },

              ]}

            />



            {Platform.OS !== "web" && (

              <TouchableOpacity

                style={styles.iconButton}

                onPress={() =>
                  setShowPassword(
                    !showPassword
                  )
                }

              >

                <MaterialIcons

                  name={
                    showPassword
                      ? "visibility"
                      : "visibility-off"
                  }

                  size={22}

                  color={
                    colors.icon
                  }

                />


              </TouchableOpacity>

            )}



          </View>





          {!!error && (

            <Text style={styles.error}>

              {error}

            </Text>

          )}






          <View style={styles.actions}>


            <TouchableOpacity

              style={[
                styles.button,
                styles.cancel,
              ]}

              onPress={handleClose}

              disabled={loading}

            >

              <Text style={styles.buttonText}>

                Cancel

              </Text>

            </TouchableOpacity>





            <TouchableOpacity

              style={[
                styles.button,
                styles.confirm,
              ]}

              onPress={handleConfirm}

              disabled={loading}

            >

              {

                loading ? (

                  <ActivityIndicator
                    color="white"
                  />

                ) : (

                  <Text style={styles.buttonText}>

                    Confirm

                  </Text>

                )

              }

            </TouchableOpacity>


          </View>




        </View>


      </View>


    </Modal>

  );

}




const styles = StyleSheet.create({

  overlay: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.45)",

    justifyContent:
      "center",

    alignItems:
      "center",

    padding:20,
  },


  card: {

    width:"100%",

    maxWidth:420,

    borderRadius:20,

    borderWidth:1,

    padding:26,

    elevation:10,

    shadowColor:"#000",

    shadowOpacity:0.18,

    shadowRadius:12,

    shadowOffset:{
      width:0,
      height:6,
    },

  },


  title:{
    fontSize:22,
    fontWeight:"700",
    textAlign:"center",
    marginBottom:8,
  },


  subtitle:{
    fontSize:14,
    textAlign:"center",
    lineHeight:20,
    marginBottom:24,
  },


  inputWrapper:{
    justifyContent:"center",
  },


  input:{
    borderWidth:1,
    borderRadius:12,

    paddingHorizontal:14,
    paddingVertical:13,

    fontSize:15,
  },


  iconButton:{
    position:"absolute",

    right:14,

    width:35,

    height:45,

    justifyContent:"center",

    alignItems:"center",
  },


  error:{
    color:"#DC2626",

    marginTop:10,

    fontSize:13,
  },


  actions:{
    flexDirection:"row",

    justifyContent:"flex-end",

    gap:12,

    marginTop:26,
  },


  button:{
    minWidth:95,

    paddingHorizontal:22,

    paddingVertical:11,

    borderRadius:10,

    alignItems:"center",
  },


  cancel:{
    backgroundColor:"#6B7280",
  },


  confirm:{
    backgroundColor:"#2563EB",
  },


  buttonText:{
    color:"#FFF",

    fontWeight:"600",
  },

});