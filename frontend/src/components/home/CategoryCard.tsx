import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';

interface CategoryCardProps {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  count: number;
  color: string;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  icon,
  count,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
      data-testid={`category-card-${name.toLowerCase()}`}
    >
      <LinearGradient
        colors={[Colors.backgroundCard, Colors.backgroundLight]}
        style={styles.gradient}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.count}>{count} véhicules</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textSecondary}
          style={styles.arrow}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  count: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  arrow: {
    marginLeft: Spacing.sm,
  },
});
