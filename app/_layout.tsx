// ============================================================
// app/_layout.tsx  →  Root Layout (UPDATED)
//
// Registers all screens in the navigation stack.
// Expo Router reads this file automatically.
//
// Screen order:
//   index        → Login / Sign Up   (Screen 1 - yours)
//   process-list → Process List      (Screen 2 - yours)
//   process      → Process Detail    (Screen 3 - collaborator's)
// ============================================================

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

        {/* Screen 1: Login / Sign Up */}
        <Stack.Screen name="index" />

        {/* Screen 2: Process List (your mockup) */}
        <Stack.Screen name="process-list" />

        {/* Screen 3: Process Detail (collaborator's existing screen) */}
        <Stack.Screen name="process" />

      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
