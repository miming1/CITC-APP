import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "../../constants/theme";

interface Props {
  text: string;
}

export default function Tooltip({
  text,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(2500),

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 6,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),

        Animated.delay(2500),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.tooltip,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor:
            colorScheme === "dark"
              ? "#1F2937"
              : "#FFFFFF",
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.accent,
          {
            backgroundColor: colors.tint,
          },
        ]}
      />

      <Text
        style={[
          styles.text,
          {
            color: colors.text,
          },
        ]}
      >
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderRadius: 14,

    paddingHorizontal: 14,
    paddingVertical: 10,

    minWidth: 150,
    maxWidth: 240,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  accent: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 999,
    marginRight: 10,
  },

  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});