import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";


type FAQ = {
  question: string;
  answer?: string;
};


type FAQModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (procedureId: number, data: FAQ) => void;
  initialData?: FAQ | null;
  procedureId: number;

  onRequestAuth?: (data: FAQ) => void;
};



export default function FAQModal({
  visible,
  onClose,
  onSave,
  initialData,
  procedureId,
  onRequestAuth
}: FAQModalProps) {


  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  const [question,setQuestion] = useState("");
  const [answer,setAnswer] = useState("");



  useEffect(()=>{

    if(initialData){

      setQuestion(initialData.question ?? "");
      setAnswer(initialData.answer ?? "");

    }
    else{

      setQuestion("");
      setAnswer("");

    }

  },[initialData,visible]);

  const handleSave = () => {
  if (!question.trim())
    return;

  const faqData = {
    question: question.trim(),
    answer: answer.trim(),
  };

  if (onRequestAuth) {
    onRequestAuth(faqData);
    return;
  }

  onSave(
    procedureId,
    faqData
  );

  setQuestion("");
  setAnswer("");

};

  return (

    <Modal

      visible={visible}

      transparent

      animationType="fade"

      onRequestClose={onClose}

    >


      <KeyboardAvoidingView

        style={styles.overlay}

        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }

      >


        <View

          style={[
            styles.container,
            {
              backgroundColor:colors.background,
              borderColor:colors.border,
            }
          ]}

        >



          {/* HEADER */}

          <View style={styles.header}>


            <View

              style={[
                styles.iconBox,
                {
                  backgroundColor:
                    colorScheme==="dark"
                    ? "#3A2C12"
                    : "#FEF3C7"
                }
              ]}

            >

              <MaterialIcons

                name="help-outline"

                size={28}

                color={colors.tint2}

              />


            </View>




            <View style={styles.headerText}>


              <Text

                style={[
                  styles.title,
                  {
                    color:colors.text,
                    fontFamily:Fonts.rounded,
                  }
                ]}

              >

                {initialData
                  ? "Edit FAQ"
                  : "Add FAQ"
                }

              </Text>



              <Text

                style={[
                  styles.subtitle,
                  {
                    color:colors.icon
                  }
                ]}

              >

                Add frequently asked questions for this category.

              </Text>


            </View>




            <TouchableOpacity

              onPress={onClose}

            >

              <MaterialIcons

                name="close"

                size={24}

                color={colors.icon}

              />

            </TouchableOpacity>



          </View>





          <ScrollView

            showsVerticalScrollIndicator={false}

          >




          <Text

            style={[
              styles.label,
              {
                color:colors.text
              }
            ]}

          >

            Question

          </Text>



          <TextInput

            value={question}

            onChangeText={setQuestion}

            placeholder="Enter question..."

            placeholderTextColor={colors.icon}

            multiline

            style={[
              styles.input,
              {
                color:colors.text,

                borderColor:colors.border,

                backgroundColor:
                  colorScheme==="dark"
                  ? "rgba(255,255,255,0.05)"
                  : "#F8FAFC"
              }
            ]}

          />





          <Text

            style={[
              styles.label,
              {
                color:colors.text
              }
            ]}

          >

            Answer

          </Text>




          <TextInput

            value={answer}

            onChangeText={setAnswer}

            placeholder="Enter answer..."

            placeholderTextColor={colors.icon}

            multiline

            style={[
              styles.input,
              {
                color:colors.text,

                borderColor:colors.border,

                backgroundColor:
                  colorScheme==="dark"
                  ? "rgba(255,255,255,0.05)"
                  : "#F8FAFC"
              }
            ]}

          />




          </ScrollView>





          <View style={styles.actions}>


            <TouchableOpacity

              style={[
                styles.cancel,
                {
                  borderColor:colors.border
                }
              ]}

              onPress={onClose}

            >

              <Text

                style={{
                  color:colors.text,
                  fontWeight:"600"
                }}

              >

                Cancel

              </Text>


            </TouchableOpacity>





            <TouchableOpacity

              style={[
                styles.save,
                {
                  backgroundColor:colors.tint
                }
              ]}

              onPress={handleSave}

            >

              <Text style={styles.saveText}>

                Save FAQ

              </Text>

            </TouchableOpacity>



          </View>




        </View>


      </KeyboardAvoidingView>


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


  container:{
    width:"100%",
    maxWidth:500,
    borderRadius:24,
    borderWidth:1,
    padding:24,
    elevation:12,
  },


  header:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:22,
  },


  iconBox:{
    width:54,
    height:54,
    borderRadius:16,
    justifyContent:"center",
    alignItems:"center",
    marginRight:14,
  },


  headerText:{
    flex:1,
  },


  title:{
    fontSize:22,
    fontWeight:"700",
  },


  subtitle:{
    fontSize:13,
    marginTop:3,
  },


  label:{
    fontSize:15,
    fontWeight:"700",
    marginBottom:8,
    marginTop:12,
  },


  input:{
    borderWidth:1,
    borderRadius:16,
    padding:14,
    minHeight:100,
    fontSize:15,
    textAlignVertical:"top",
  },


  actions:{
    flexDirection:"row",
    justifyContent:"flex-end",
    gap:12,
    marginTop:20,
  },


  cancel:{
    borderWidth:1,
    borderRadius:14,
    paddingHorizontal:18,
    paddingVertical:12,
  },


  save:{
    borderRadius:14,
    paddingHorizontal:20,
    paddingVertical:12,
  },


  saveText:{
    color:"#fff",
    fontWeight:"700",
  },

});