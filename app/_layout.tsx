
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider, useTheme } from '@/hooks/use-theme';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Wrapper />
      </AuthProvider>
    </ThemeProvider>
  )
}

function Wrapper() {
  const { colors } = useTheme();
  const animationType = Platform.OS === 'android' ? 'default' : 'ios_from_right';
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: animationType,
        animationDuration: 300,
        gestureEnabled: true,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
