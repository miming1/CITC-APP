import {
    StyleSheet,
    Text,
    useColorScheme,
} from "react-native";

import { Colors } from "../constants/theme";

interface Props {
  title: string;
}

export default function AdminSectionTitle({
  title,
}: Props) {

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Text
      style={[
        styles.title,
        {
          color: colors.text,
        },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
});