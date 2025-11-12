import { useTheme } from "@/hooks/use-theme";
import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from "react-native";

export interface TextProps extends RNTextProps {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: "title" | "subtitle" | "body" | "caption";
  color?: string;
}

export function Text({
  children,
  style,
  variant = "body",
  color,
  ...props
}: TextProps) {
  const { colors } = useTheme();

  const variantStyles: Record<
    NonNullable<TextProps["variant"]>,
    TextStyle
  > = {
    title: {
      fontSize: 24,
      fontWeight: "700" as TextStyle["fontWeight"],
      color: colors.foreground,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "600" as TextStyle["fontWeight"],
      color: color ?? colors.foreground,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as TextStyle["fontWeight"],
      color: color ?? colors.foreground,
    },
    caption: {
      fontSize: 13,
      fontWeight: "300" as TextStyle["fontWeight"],
      color: color ?? colors.foreground,
    },
  };

  const variantStyle = variantStyles[variant];

  return (
    <RNText {...props} style={[variantStyle, style]}>
      {children}
    </RNText>
  );
}
