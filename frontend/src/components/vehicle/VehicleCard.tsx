import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';
import { Badge } from '../common/Badge';
import { Vehicle } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const price = vehicle.type === 'vente' || vehicle.type === 'both'
    ? vehicle.price_sale
    : vehicle.price_per_day;

  const priceLabel = vehicle.type === 'location' ? '/jour' : '';

  // Placeholder image URL
  const imageUrl = vehicle.images?.[0] || 'https://via.placeholder.com/300x200/2C2C2E/FFFFFF?text=No+Image';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.8}
      data-testid="vehicle-card"
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        <View style={styles.badge}>
          <Badge
            label={vehicle.type === 'both' ? 'Vente/Location' : vehicle.type === 'vente' ? 'Vente' : 'Location'}
            variant="info"
            size="sm"
          />
        </View>
        {!vehicle.available && (
          <View style={styles.unavailableBadge}>
            <Badge label="Non disponible" variant="error" size="sm" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {vehicle.name}
        </Text>
        <Text style={styles.brand} numberOfLines={1}>
          {vehicle.brand} • {vehicle.year}
        </Text>

        <View style={styles.specs}>
          <View style={styles.spec}>
            <Ionicons name="speedometer-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.specText}>{vehicle.mileage.toLocaleString()} km</Text>
          </View>
          <View style={styles.spec}>
            <Ionicons
              name={vehicle.transmission === 'auto' ? 'settings-outline' : 'hand-left-outline'}
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.specText}>
              {vehicle.transmission === 'auto' ? 'Auto' : 'Manuel'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{price?.toLocaleString()} DH</Text>
            {priceLabel && <Text style={styles.priceLabel}>{priceLabel}</Text>}
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  unavailableBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  brand: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  specs: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});
