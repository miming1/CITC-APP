import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  roleId?: string | number;
  adminMode?: string;
}


const MENU_ITEMS = [
  {
    label: "Processes",
    route: "/process-list",
    icon: "document-text-outline",
  },
  {
    label: "Frequently Asked Questions",
    route: "/faq",
    icon: "help-circle-outline",
  },
  {
    label: "Form Submission Progress",
    route: "/active-req",
    icon: "time-outline",
  },
  {
    label: "Submission History",
    route: "/SubmissionHistory",
    icon: "archive-outline",
  },
  {
    label: "Profile",
    route: "/editProfile",
    icon: "person-circle-outline",
  },
] as const;


export default function Header({
  title,
  showBack = true,
  roleId,
  adminMode,
}: HeaderProps) {

  const router = useRouter();

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const isAdmin =
    Number(roleId) === 2 ||
    adminMode === "true";

  const [menuOpen, setMenuOpen] = useState(false);


  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const topLine = useRef(new Animated.Value(0)).current;
  const middleLine = useRef(new Animated.Value(1)).current;
  const bottomLine = useRef(new Animated.Value(0)).current;



  useEffect(() => {

    if (menuOpen) {

      Animated.parallel([

        Animated.timing(fadeAnim,{
          toValue:1,
          duration:220,
          useNativeDriver:true,
        }),

        Animated.timing(slideAnim,{
          toValue:0,
          duration:220,
          easing:Easing.out(Easing.ease),
          useNativeDriver:true,
        }),

        Animated.timing(topLine,{
          toValue:1,
          duration:220,
          useNativeDriver:true,
        }),

        Animated.timing(bottomLine,{
          toValue:1,
          duration:220,
          useNativeDriver:true,
        }),

        Animated.timing(middleLine,{
          toValue:0,
          duration:180,
          useNativeDriver:true,
        }),

      ]).start();


    } else {


      Animated.parallel([

        Animated.timing(fadeAnim,{
          toValue:0,
          duration:180,
          useNativeDriver:true,
        }),

        Animated.timing(slideAnim,{
          toValue:-20,
          duration:180,
          useNativeDriver:true,
        }),

        Animated.timing(topLine,{
          toValue:0,
          duration:220,
          useNativeDriver:true,
        }),

        Animated.timing(bottomLine,{
          toValue:0,
          duration:220,
          useNativeDriver:true,
        }),

        Animated.timing(middleLine,{
          toValue:1,
          duration:220,
          useNativeDriver:true,
        }),

      ]).start();

    }

  },[menuOpen]);




  const handleNavigation = (route: string) => {
    setMenuOpen(false);

    const params = {
      roleId: isAdmin ? "2" : "1",
      ...(adminMode ? { admin_mode: adminMode } : {}),
    };

    router.push({
      pathname: route as any,
      params,
    });
  };

  const handleBack = () => {
    router.back();
  };

  const styles = createStyles(theme);



  return (
    <>


      <View style={styles.container}>


        {showBack ? (

          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >

            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />

          </TouchableOpacity>


        ) : (

          <View style={styles.backButton}/>

        )}



        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </Text>




        <TouchableOpacity
          activeOpacity={0.85}
          onPress={()=>setMenuOpen(true)}
          style={[
            styles.menuButton,
            menuOpen && styles.menuButtonActive
          ]}
        >


          <Animated.View
            style={[
              styles.menuLine,
              {
                transform:[
                  {
                    rotate:topLine.interpolate({
                      inputRange:[0,1],
                      outputRange:["0deg","45deg"]
                    })
                  },
                  {
                    translateY:topLine.interpolate({
                      inputRange:[0,1],
                      outputRange:[0,7]
                    })
                  }
                ]
              }
            ]}
          />


          <Animated.View
            style={[
              styles.menuLine,
              {
                opacity:middleLine
              }
            ]}
          />



          <Animated.View
            style={[
              styles.menuLine,
              {
                transform:[
                  {
                    rotate:bottomLine.interpolate({
                      inputRange:[0,1],
                      outputRange:["0deg","-45deg"]
                    })
                  },
                  {
                    translateY:bottomLine.interpolate({
                      inputRange:[0,1],
                      outputRange:[0,-7]
                    })
                  }
                ]
              }
            ]}
          />


        </TouchableOpacity>


      </View>





      <Modal
        transparent
        visible={menuOpen}
        animationType="none"
        onRequestClose={()=>setMenuOpen(false)}
      >


        <Pressable
          style={styles.overlay}
          onPress={()=>setMenuOpen(false)}
        >


          <Animated.View
            style={[
              styles.dropdown,
              {
                opacity:fadeAnim,
                transform:[
                  {
                    translateY:slideAnim
                  }
                ]
              }
            ]}
          >



            {MENU_ITEMS.map((item)=>(

              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={()=>handleNavigation(item.route)}
              >


                <View style={styles.menuIconContainer}>

                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={theme.tint}
                  />

                </View>


                <Text style={styles.menuText}>
                  {item.label}
                </Text>


                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.icon}
                />



              </TouchableOpacity>

            ))}



            <View style={styles.separator}/>



            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={()=>{

                setMenuOpen(false);
                router.replace("/");

              }}
            >


              <Ionicons
                name="log-out-outline"
                size={20}
                color="#FFFFFF"
              />


              <Text style={styles.logoutText}>
                Logout
              </Text>


            </TouchableOpacity>



          </Animated.View>


        </Pressable>


      </Modal>



    </>
  );
}



const createStyles = (theme: typeof Colors.light)=>
StyleSheet.create({

  container:{
    height:60,
    backgroundColor:theme.tint,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    paddingHorizontal:16,
    shadowColor:"#000",
    shadowOffset:{
      width:0,
      height:2,
    },
    shadowOpacity:0.12,
    shadowRadius:6,
    elevation:6,
  },


  backButton:{
    width:42,
    height:42,
    borderRadius:21,
    justifyContent:"center",
    alignItems:"center",
  },


  title:{
    flex:1,
    textAlign:"center",
    color:"#FFFFFF",
    fontSize:19,
    fontWeight:"700",
    marginHorizontal:12,
  },


  menuButton:{
    width:42,
    height:42,
    borderRadius:21,
    justifyContent:"center",
    alignItems:"center",
  },


  menuButtonActive:{
    backgroundColor:theme.tint2,
  },


  menuLine:{
    position:"absolute",
    width:20,
    height:2.8,
    borderRadius:999,
    backgroundColor:"#FFFFFF",
  },


  overlay:{
    flex:1,
    backgroundColor:"rgba(0,0,0,0.20)",
    alignItems:"flex-end",
  },


  dropdown:{
    marginTop:66,
    marginRight:12,
    width:285,
    backgroundColor:theme.background,
    borderRadius:18,
    borderWidth:1,
    borderColor:theme.border,
    overflow:"hidden",
    elevation:12,
  },


  menuItem:{
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:18,
    paddingVertical:15,
  },


  menuIconContainer:{
    width:34,
    alignItems:"center",
    justifyContent:"center",
  },


  menuText:{
    flex:1,
    marginLeft:8,
    fontSize:15,
    fontWeight:"600",
    color:theme.text,
  },


  separator:{
    height:1,
    backgroundColor:theme.border,
    marginHorizontal:14,
  },


  logoutButton:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    margin:14,
    paddingVertical:13,
    borderRadius:14,
    backgroundColor:theme.tint,
  },


  logoutText:{
    marginLeft:8,
    color:"#FFFFFF",
    fontWeight:"700",
    fontSize:15,
  },

});