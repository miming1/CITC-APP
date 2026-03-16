import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

export default function Tooltip({ text }: { text: string }) {

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
        Animated.delay(3000),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.tooltip, { opacity }]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: "#eeeeee",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,

    minWidth: 120,      // prevents compression
    maxWidth: 180,      // keeps tooltip from getting too wide
  },

  text: {
    fontSize: 12,
    color: "#333",
    flexWrap: "wrap",
  },
});