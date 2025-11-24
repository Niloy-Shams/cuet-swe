import { NotificationInitializer } from "@/components/NotificationInitializer";
import { AuthProvider } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";


export default function StudentLayout() {
  const { colors } = useTheme()
  return (
    <AuthProvider>
      <NotificationInitializer />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </AuthProvider>
  );
}
