import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, FontSizes } from '../../constants/spacing';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  actionText,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container} data-testid="section-header">
      <Text style={styles.title}>{title}</Text>
      {actionText && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          style={styles.actionButton}
          data-testid="section-action-button"
        >
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
});