import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';
import { Vehicle } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.lg * 2;

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  variant = 'default',
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getPrice = () => {
    if (vehicle.type === 'vente' && vehicle.price_sale) {
      return `${vehicle.price_sale.toLocaleString('fr-FR')} €`;
    }
    if (vehicle.type === 'location' && vehicle.price_per_day) {
      return `${vehicle.price_per_day.toLocaleString('fr-FR')} €/jour`;
    }
    if (vehicle.type === 'both') {
      return vehicle.price_per_day 
        ? `${vehicle.price_per_day.toLocaleString('fr-FR')} €/jour`
        : `${vehicle.price_sale?.toLocaleString('fr-FR')} €`;
    }
    return 'Prix sur demande';
  };

  const getCategoryColor = () => {
    return Colors.categoryBadge[vehicle.category as keyof typeof Colors.categoryBadge] || Colors.primary;
  };

  if (variant === 'compact') {
    return (
      <AnimatedTouchable
        style={[styles.compactCard, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: vehicle.images[0] || 'https://via.placeholder.com/400x250/2C2C2E/FFFFFF?text=Vehicule' }}
          style={styles.compactImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {vehicle.name}
          </Text>
          <Text style={styles.compactPrice}>{getPrice()}</Text>
        </View>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={[styles.card, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: vehicle.images[0] || 'https://via.placeholder.com/400x250/2C2C2E/FFFFFF?text=Vehicule' }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        
        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: vehicle.type === 'vente' ? Colors.success : Colors.info }]}>
          <Text style={styles.typeBadgeText}>
            {vehicle.type === 'vente' ? 'À vendre' : vehicle.type === 'location' ? 'À louer' : 'Vente/Location'}
          </Text>
        </View>

        {/* Category badge */}
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor() }]}>
          <Text style={styles.categoryBadgeText}>{vehicle.category}</Text>
        </View>

        {/* Availability indicator */}
        {!vehicle.available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableBadgeText}>Non disponible</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.brand}>{vehicle.brand}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {vehicle.name}
            </Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.price}>{getPrice()}</Text>
          </View>
        </View>

        {/* Specs */}
        <View style={styles.specs}>
          <View style={styles.specItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.year}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.mileage.toLocaleString('fr-FR')} km</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="settings-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.transmission === 'auto' ? 'Auto' : 'Manuel'}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.fuel}</Text>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    width: CARD_WIDTH,
    alignSelf: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  unavailableBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.error,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  unavailableBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  brand: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: FontSizes.lg,
    color: Colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FontSizes.lg,
    color: Colors.primary,
    fontWeight: '700',
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  // Compact variant
  compactCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    width: 160,
    marginRight: Spacing.sm,
  },
  compactImage: {
    width: '100%',
    height: 120,
  },
  compactContent: {
    padding: Spacing.sm,
  },
  compactTitle: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactPrice: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
  },
});
