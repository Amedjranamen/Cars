import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';
import { Vehicle } from '../../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
  const price = vehicle.price_sale || vehicle.price_per_day;
  const priceLabel = vehicle.price_sale ? 'Prix' : '/jour';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      data-testid={`vehicle-card-${vehicle._id}`}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {vehicle.images && vehicle.images.length > 0 ? (
          <Image
            source={{ uri: vehicle.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="car-sport" size={40} color={Colors.textSecondary} />
          </View>
        )}
        
        {/* Type Badge */}
        <View style={[styles.typeBadge, 
          vehicle.type === 'vente' ? styles.typeSale : 
          vehicle.type === 'location' ? styles.typeRent : 
          styles.typeBoth
        ]}>
          <Text style={styles.typeBadgeText}>
            {vehicle.type === 'vente' ? '💰 Vente' : 
             vehicle.type === 'location' ? '🔑 Location' : 
             '🆕 Vente/Location'}
          </Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>{vehicle.brand}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{vehicle.category}</Text>
          </View>
        </View>
        
        <Text style={styles.name} numberOfLines={1}>
          {vehicle.name}
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="speedometer-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.featureText}>{vehicle.mileage.toLocaleString()} km</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.featureText}>{vehicle.year}</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons 
              name={vehicle.transmission === 'auto' ? 'settings-outline' : 'git-branch-outline'} 
              size={14} 
              color={Colors.textSecondary} 
            />
            <Text style={styles.featureText}>
              {vehicle.transmission === 'auto' ? 'Auto' : 'Manuel'}
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {price ? `${price.toLocaleString()} DH` : 'Prix NC'}
          </Text>
          {vehicle.price_per_day && (
            <Text style={styles.priceLabel}>{priceLabel}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeSale: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
  },
  typeRent: {
    backgroundColor: 'rgba(10, 132, 255, 0.9)',
  },
  typeBoth: {
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
  },
  typeBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundElevated,
  },
  categoryText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  featureText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  price: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  priceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
});