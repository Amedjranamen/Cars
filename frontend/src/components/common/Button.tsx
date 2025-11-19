import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, FontSizes } from '../../constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: Colors.primary };
      case 'secondary':
        return { ...baseStyle, backgroundColor: Colors.secondary };
      case 'outline':
        return { 
          ...baseStyle, 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primary,
        };
      case 'danger':
        return { ...baseStyle, backgroundColor: Colors.error };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    if (variant === 'outline') {
      return { ...baseStyle, color: Colors.primary };
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  text: {
    fontWeight: '600',
    color: Colors.white,
  },
  smallText: {
    fontSize: FontSizes.sm,
  },
  mediumText: {
    fontSize: FontSizes.md,
  },
  largeText: {
    fontSize: FontSizes.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});
