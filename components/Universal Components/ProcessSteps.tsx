import { MaterialIcons } from "@expo/vector-icons";
import {
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import { Colors } from "../../constants/theme";

interface StepItemProps {
  number: number;
  text: string;
  sub?: string;
  link?: string;
  checked?: boolean;
  onToggle?: () => void;
  isAdmin?: boolean;
}

export default function StepItem({
  number,
  text,
  sub,
  link,
  checked,
  onToggle,
  isAdmin = false,
}: StepItemProps) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];


  const checkColor =
    colorScheme === "light"
      ? colors.tint
      : colors.tint2;



  const handleOpenLink = async () => {

    if (!link) return;

    let formatted = link;

    if (
      !formatted.startsWith("http://") &&
      !formatted.startsWith("https://")
    ) {
      formatted = "https://" + formatted;
    }


    try {
      await Linking.openURL(formatted);
    } catch (err) {
      console.log("Failed to open link:", err);
    }
  };


  return (
    <View style={styles.container}>


      {/* CHECKBOX (Student only) */}

      {!isAdmin && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggle ?? (() => {})}
          style={[
            styles.checkbox,
            {
              borderColor: checkColor,
              backgroundColor: checked
                ? checkColor
                : "transparent",
            },
          ]}
        >
          {checked && (
            <MaterialIcons
              name="check"
              size={16}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      )}



      {/* STEP BADGE */}

      <View
        style={[
          styles.badge,
          {
            backgroundColor: checked
              ? colors.icon
              : colors.tint,
            marginLeft: isAdmin ? 0 : 0,
            marginRight: 14,
          },
        ]}
      >

        <Text style={styles.badgeText}>
          {number}
        </Text>

      </View>



      {/* CONTENT */}

      <View
        style={[
          styles.content,
          !isAdmin && checked && styles.Approved,
        ]}
      >

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          {text}
        </Text>



        {sub && (
          <Text
            style={[
              styles.sub,
              {
                color: colors.icon,
              },
            ]}
          >
            {sub}
          </Text>
        )}



        {link && (
          <TouchableOpacity
            onPress={handleOpenLink}
            activeOpacity={0.7}
            style={styles.linkContainer}
          >

            <MaterialIcons
              name="link"
              size={15}
              color={colors.tint}
            />

            <Text
              style={[
                styles.link,
                {
                  color: colors.tint,
                },
              ]}
            >
              Open Reference
            </Text>

          </TouchableOpacity>
        )}

      </View>


    </View>
  );
}



const styles = StyleSheet.create({

  container:{
    flexDirection:"row",
    alignItems:"flex-start",

    marginBottom:22,
  },


  checkbox:{
    width:24,
    height:24,

    borderRadius:6,
    borderWidth:2,

    alignItems:"center",
    justifyContent:"center",

    marginTop:5,
    marginRight:12,
  },


  badge:{
    width:34,
    height:34,

    borderRadius:17,

    alignItems:"center",
    justifyContent:"center",

    marginRight:14,
    marginLeft:0,
  },


  badgeText:{
    color:"#FFFFFF",
    fontWeight:"700",
    fontSize:14,
  },


  content:{
    flex:1,

    paddingTop:2,
  },


  title:{
    fontSize:15,
    fontWeight:"700",

    lineHeight:21,
  },


  sub:{
    fontSize:13,

    lineHeight:18,

    marginTop:5,
  },


  linkContainer:{
    flexDirection:"row",
    alignItems:"center",

    marginTop:8,
  },


  link:{
    fontSize:13,

    fontWeight:"600",

    marginLeft:5,

    textDecorationLine:"underline",
  },


  Approved:{
    opacity:0.55,
  },

});