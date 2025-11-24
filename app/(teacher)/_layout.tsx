import { NotificationInitializer } from "@/components/NotificationInitializer";
import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";


export default function TeacherLayout() {
  const { colors } = useTheme()
  return (
    <>
      <NotificationInitializer />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
