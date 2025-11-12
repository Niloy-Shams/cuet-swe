// components/ui/themed-background.tsx
import { ColorScheme, useTheme } from '@/hooks/use-theme';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ThemedBackgroundProps {
    children: React.ReactNode;
    style?: ViewStyle;
    useSafeArea?: boolean;
}

export function Container({
    children,
    style,
    useSafeArea = true,
}: ThemedBackgroundProps) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    if (useSafeArea) {
        return (
            <View style={styles.container}>
                <SafeAreaView
                    style={[styles.safeArea, style]}
                    edges={{bottom:'off', top: 'maximum'}}
                >
                    {children}
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
}

const getStyles = (colors: ColorScheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
    },
});