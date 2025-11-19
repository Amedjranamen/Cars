import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'category';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  categoryColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  categoryColor,
}) => {
  const getBackgroundColor = () => {
    if (variant === 'category' && categoryColor) {
      return categoryColor;
    }
    
    switch (variant) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'info':
        return Colors.info;
      default:
        return Colors.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 8, paddingVertical: 4, fontSize: FontSizes.xs };
      case 'large':
        return { paddingHorizontal: 16, paddingVertical: 10, fontSize: FontSizes.md };
      default:
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: FontSizes.sm };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
        { paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize }, textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
  },
});