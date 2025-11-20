import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';
import { Vehicle } from '../../types';

interface VehicleCardHorizontalProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export function VehicleCardHorizontal({ vehicle, onPress }: VehicleCardHorizontalProps) {
  const price = vehicle.price_sale || vehicle.price_per_day;
  const priceLabel = vehicle.price_sale ? '' : '/jour';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      data-testid={`vehicle-card-horizontal-${vehicle._id}`}
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
            <Ionicons name="car-sport" size={32} color={Colors.textSecondary} />
          </View>
        )}
        
        {/* New Badge */}
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>✨ Nouveau</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>{vehicle.brand}</Text>
          <View style={[
            styles.typeBadge,
            vehicle.type === 'vente' ? styles.typeSale : 
            vehicle.type === 'location' ? styles.typeRent : 
            styles.typeBoth
          ]}>
            <Text style={styles.typeBadgeText}>
              {vehicle.type === 'vente' ? 'Vente' : 
               vehicle.type === 'location' ? 'Location' : 
               'Les 2'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.name} numberOfLines={2}>
          {vehicle.name}
        </Text>

        {/* Features Row */}
        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.featureText}>{vehicle.year}</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="speedometer-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.featureText}>{vehicle.mileage.toLocaleString()} km</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {price ? `${price.toLocaleString()} DH${priceLabel}` : 'Prix NC'}
          </Text>
          <TouchableOpacity style={styles.arrowButton}>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 160,
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
  newBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 149, 0, 0.9)',
  },
  newBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.white,
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
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeSale: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  typeRent: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  typeBoth: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  typeBadgeText: {
    fontSize: FontSizes.xs,
    color: Colors.white,
    fontWeight: '600',
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    minHeight: 38,
  },
  featuresRow: {
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  price: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
});