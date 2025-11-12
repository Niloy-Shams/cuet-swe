import { useTheme } from "@/hooks/use-theme";
import { Link, LinkProps } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from "react-native";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost";

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends TouchableOpacityProps {
    children?: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    href?: LinkProps["href"];
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle | ViewStyle[];
    textStyle?: TextStyle | TextStyle[];
}

export default function Button({
    children,
    variant = "primary",
    size = "md",
    href,
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
    textStyle,
    ...props
}: ButtonProps) {
    const { colors, isDarkMode } = useTheme();

    const getVariantStyle = (): {
        container: ViewStyle;
        text: TextStyle;
    } => {
        switch (variant) {
            case "secondary":
                return {
                    container: {
                        backgroundColor: isDarkMode ? '#43454aff' : '#7b7b7bff',
                    },
                    text: { color: '#fff' },
                };
            case "outline":
                return {
                    container: {
                        backgroundColor: "transparent",
                        borderWidth: 1,
                        borderColor: '#888',
                    },
                    text: { color: colors.foreground },
                };
            case "destructive":
                return {
                    container: {
                        backgroundColor: colors.destructive,
                    },
                    text: { color: colors.destructiveForeground },
                };
            case "ghost":
                return {
                    container: {
                        backgroundColor: "transparent",
                    },
                    text: { color: colors.foreground },
                };
            case "primary":
            default:
                return {
                    container: {
                        backgroundColor: colors.primary,
                    },
                    text: { color: colors.foreground },
                };
        }
    };

    const getSizeStyle = (): ViewStyle => {
        switch (size) {
            case "sm":
                return { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 };
            case "lg":
                return { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 10 };
            case "md":
            default:
                return { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 };
        }
    };

    const variantStyle = getVariantStyle();
    const sizeStyle = getSizeStyle();

    const containerStyle: ViewStyle[] = [
        {
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
        },
        sizeStyle,
        variantStyle.container,
        {
            opacity: disabled ? 0.5 : 1,
            width: fullWidth ? "100%" : undefined,
        },
        ...(Array.isArray(style) ? style : style ? [style] : []),
    ];

    const textStyles: TextStyle[] = [
        { fontSize: 16, fontWeight: 500 },
        variantStyle.text,
        ...(Array.isArray(textStyle) ? textStyle : textStyle ? [textStyle] : []),
    ];

    const buttonContent = (
        <TouchableOpacity
            {...props}
            disabled={disabled || loading}
            style={[containerStyle]}
        >
            {loading ? (
                <ActivityIndicator color={variantStyle.text.color} />
            ) : (
                <Text style={textStyles}>{children}</Text>
            )}
        </TouchableOpacity>
    );

    if (href && !disabled && !loading) {
        return (
            <TouchableOpacity
                {...props}
                disabled={disabled || loading}
                style={[containerStyle]}
            >
                {loading ? (
                    <ActivityIndicator color={variantStyle.text.color} />
                ) : (
                    <Link href={href}>
                        <Text style={textStyles}>{children}</Text>
                    </Link>
                )}
            </TouchableOpacity>
        );
    }

    return buttonContent;
}