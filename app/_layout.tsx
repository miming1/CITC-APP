import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../lib/auth-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>

         <Stack.Screen name="index" />
         <Stack.Screen name="Userdashboard" />
         <Stack.Screen name="AdminDashboard" />
         <Stack.Screen name="TrackedResults" />
         <Stack.Screen name="editProfile" />
         <Stack.Screen name="process-list" />
         <Stack.Screen name="process" />
         <Stack.Screen name="faq" />
         <Stack.Screen name="track" />
         <Stack.Screen name="track-details" />
         <Stack.Screen name="SearchResults" />
         <Stack.Screen name="active-req" />
         <Stack.Screen name="SubmissionHistory" />

        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}