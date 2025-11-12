import { AuthProvider } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function StudentLayout() {
  const { colors } = useTheme()
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </AuthProvider>
  );
}
