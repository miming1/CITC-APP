import React from "react";
import {
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";


interface Props {
  children: React.ReactNode;
}


export default function ResponsiveContainer({
  children,
}: Props) {

  const { width } = useWindowDimensions();

  const isDesktop = width >= 768;


  return (
    <View
      style={[
        styles.container,
        isDesktop && styles.desktopContainer,
      ]}
    >
      {children}
    </View>
  );
}



const styles = StyleSheet.create({

  container:{
    width:"100%",
    paddingHorizontal:16,
  },


  desktopContainer:{
    width:"90%",
    maxWidth:1400,
    alignSelf:"center",
  },

});