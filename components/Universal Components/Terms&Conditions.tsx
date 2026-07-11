import { MaterialIcons } from "@expo/vector-icons";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const { height: SCREEN_H } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({
  visible,
  onClose,
}: Props) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme] ?? Colors.light;
  


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >

      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >

        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
          onPress={() => {}}
        >


          {/* HEADER */}

          <View style={styles.header}>

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "#EBA937"
                      : "#fcb843",
                },
              ]}
            >

              <MaterialIcons
                name="description"
                size={28}
                color={colors.tint}
              />

            </View>


            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontFamily: Fonts.rounded,
                },
              ]}
            >
              Terms & Conditions
            </Text>

          </View>


          {/* GOLD DIVIDER */}

          <View
            style={[
              styles.divider,
              {
                backgroundColor: colors.tint2,
              },
            ]}
          />



          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
          >

            <Text style={[styles.section, {color: colors.text}]}>
              1. Acceptance of Terms
            </Text>

            <Text style={[styles.body,{color: colors.icon}]}>
              By creating an account and using the CITC Academic Procedure Portal (CITC-APP),
              you agree to be bound by these Terms and Conditions. If you do not agree,
              please do not use the App.
            </Text>



            <Text style={[styles.section,{color:colors.text}]}>
              2. Use of the App
            </Text>

            <Text style={[styles.body,{color:colors.icon}]}>
              The App is intended solely for students, faculty, and staff of USTP-CDO's
              College of Information Technology and Computing (CITC). You agree to use the
              App only for its intended purpose: tracking and managing academic procedures
              and document submissions.
            </Text>



            <Text style={[styles.section,{color:colors.text}]}>
              3. Account Responsibility
            </Text>

            <Text style={[styles.body,{color:colors.icon}]}>
              You are responsible for maintaining the confidentiality of your account
              credentials. Notify the CITC administration immediately of any unauthorized
              use.
            </Text>



            <Text style={[styles.section,{color:colors.text}]}>
              4. Privacy & Data
            </Text>

            <Text style={[styles.body,{color:colors.icon}]}>
              Your personal information is collected solely for authentication and
              communication purposes within USTP-CDO internal systems.
            </Text>



            <Text style={[styles.section,{color:colors.text}]}>
              5. Document Submissions
            </Text>

            <Text style={[styles.body,{color:colors.icon}]}>
              You are responsible for the accuracy of all submitted documents and
              information.
            </Text>



            <Text style={[styles.section,{color:colors.text}]}>
              6. Modifications
            </Text>

            <Text style={[styles.body,{color:colors.icon}]}>
              CITC reserves the right to modify these Terms at any time.
            </Text>



            <Text style={[styles.section,{color:colors.text}]}>
              7. Contact
            </Text>

            <Text style={[styles.body,{color:colors.icon}]}>
              For questions regarding these Terms, please contact the CITC administration
              office.
            </Text>


            <View style={{height:8}} />

          </ScrollView>



          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.tint,
              },
            ]}
            onPress={onClose}
          >

            <Text style={styles.buttonText}>
              I Understand
            </Text>

          </TouchableOpacity>


        </Pressable>

      </Pressable>

    </Modal>
  );
}


const styles = StyleSheet.create({

  overlay:{
    flex:1,
    backgroundColor:"rgba(20,26,115,0.35)",
    justifyContent:"center",
    alignItems:"center",
    padding:24,
  },


  card:{
    width:"100%",
    maxWidth:520,

    borderRadius:24,
    borderWidth:1,

    padding:24,

    maxHeight:
      Platform.OS === "web"
        ? "85%" as any
        : SCREEN_H * 0.8,

    elevation:10,

    shadowColor:"#000",
    shadowOpacity:0.15,
    shadowRadius:20,
    shadowOffset:{
      width:0,
      height:8,
    },
  },


  header:{
    alignItems:"center",
    marginBottom:18,
  },


  iconContainer:{
    width:56,
    height:56,

    borderRadius:18,

    alignItems:"center",
    justifyContent:"center",

    marginBottom:12,
  },


  title:{
    fontSize:22,
    fontWeight:"700",
    textAlign:"center",
  },


  divider:{
    height:3,
    borderRadius:10,

    width:60,

    alignSelf:"center",

    marginBottom:18,
  },


  scrollArea:{
    maxHeight:SCREEN_H * 0.5,
  },


  scrollContent:{
    paddingBottom:8,
  },


  section:{
    fontSize:15,
    fontWeight:"700",

    marginTop:14,
    marginBottom:5,
  },


  body:{
    fontSize:13,
    lineHeight:20,
  },


  button:{
    borderRadius:14,

    paddingVertical:13,
    paddingHorizontal:32,

    alignItems:"center",

    marginTop:18,
  },


  buttonText:{
    color:"#FFFFFF",

    fontSize:15,
    fontWeight:"700",
  },

});