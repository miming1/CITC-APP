import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>

       <Stack.Screen name="index" />
       <Stack.Screen name="Userdashboard" />
       <Stack.Screen name="process-list" />
       <Stack.Screen name="process" />
       <Stack.Screen name="SearchResults" />
       <Stack.Screen name="SubmissionHistory" />
       <Stack.Screen name="faq" />

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}