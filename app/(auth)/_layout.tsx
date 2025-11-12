import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";


export default function TeacherLayout() {
  const { colors } = useTheme()
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
