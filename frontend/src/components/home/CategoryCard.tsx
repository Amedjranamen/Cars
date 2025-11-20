import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';

interface CategoryCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  color: string;
  onPress: () => void;
}

export function CategoryCard({
  name,
  icon,
  count,
  color,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      data-testid={`category-card-${name.toLowerCase()}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.count}>{count} véhicule{count !== 1 ? 's' : ''}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  count: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});