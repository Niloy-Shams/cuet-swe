import { ColorScheme, useTheme } from '@/hooks/use-theme';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';

type CardProps = {
    children: ReactNode;
    style?: ViewStyle | ViewStyle[];
};

type CardSectionProps = {
    children: ReactNode;
    style?:ViewStyle | ViewStyle[];
};

type CardSectionTextProps = Omit<CardSectionProps, 'style'> & {
    style?: TextStyle | TextStyle[];
};


// 🌸 Card Root
export const Card = ({ children, style }: CardProps) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles(colors).card,
                style,
            ]}
        >
            {children}
        </View>
    );
};

// 🌼 Card Header
export const CardHeader = ({ children, style }: CardSectionProps) => {
    const { colors } = useTheme();

    return (
        <View style={[styles(colors).cardHeader, style]}>
            {typeof children === 'string' ? (
                <Text style={styles(colors).cardTitle}>{children}</Text>
            ) : (
                children
            )}
        </View>
    );
};

// 🌿 Card Title
export const CardTitle = ({ children, style }: CardSectionTextProps) => {
    const { colors } = useTheme();

    return (
        <Text style={[styles(colors).cardTitle, style]}>{children}</Text>
    );
};

// 🌱 Card Description
export const CardDescription = ({ children, style }: CardSectionTextProps) => {
    const { colors } = useTheme();

    return (
        <Text style={[styles(colors).cardDescription, style]}>{children}</Text>
    );
};

// 🌻 Card Content
export const CardContent = ({ children, style }: CardSectionProps) => {
    const { colors } = useTheme();

    return (
        <View style={[styles(colors).cardContent, style]}>{children}</View>
    );
};

// 🌺 Card Footer
export const CardFooter = ({ children, style }: CardSectionProps) => {
    const { colors } = useTheme();

    return (
        <View style={[styles(colors).cardFooter, style]}>{children}</View>
    );
};

// 💅 Styles
const styles = (colors: ColorScheme) =>
    StyleSheet.create({
        card: {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 10,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
            elevation: 2,
        },
        cardHeader: {
            marginBottom: 8,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.foreground,
        },
        cardDescription: {
            fontSize: 14,
            color: colors.mutedForeground,
            marginTop: 2,
        },
        cardContent: {
            marginVertical: 8,
        },
        cardFooter: {
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: 12,
            paddingTop: 8,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
    });
