import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Rechercher un véhicule...',
}: SearchBarProps) {
  return (
    <View style={styles.container} data-testid="search-bar">
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          data-testid="search-input"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearButton}
            data-testid="clear-search-button"
          >
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        data-testid="filter-button"
      >
        <Ionicons name="options-outline" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 50,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});