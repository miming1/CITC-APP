import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../lib/auth-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === "web") {
      const styleId = "hide-native-password-toggles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          input::-ms-reveal,
          input::-ms-clear {
            display: none;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>

         <Stack.Screen name="index" />
         <Stack.Screen name="UserDashboard" />
         <Stack.Screen name="AdminDashboard" />
         <Stack.Screen name="QRScanResult" />
         <Stack.Screen name="Profile" />
         <Stack.Screen name="ProcedurePage" />
         <Stack.Screen name="ProcedureTab" />
         <Stack.Screen name="FAQPage" />
         <Stack.Screen name="TrackingPage" />
         <Stack.Screen name="ConfirmationPage" />
         <Stack.Screen name="SearchResults" />
         <Stack.Screen name="ActiveRequests" />
         <Stack.Screen name="SubmissionHistory" />
         <Stack.Screen name="Notifications" />

        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}