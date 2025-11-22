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
const CARD_WIDTH = width * 0.75;

interface VehicleCardHorizontalProps {
  vehicle: Vehicle;
  onPress: () => void;
}

export const VehicleCardHorizontal: React.FC<VehicleCardHorizontalProps> = ({
  vehicle,
  onPress,
}) => {
  const price = vehicle.type === 'vente' || vehicle.type === 'both'
    ? vehicle.price_sale
    : vehicle.price_per_day;

  const priceLabel = vehicle.type === 'location' ? '/jour' : '';

  // Placeholder image URL
  const imageUrl = vehicle.images?.[0] || 'https://via.placeholder.com/400x250/2C2C2E/FFFFFF?text=No+Image';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.8}
      data-testid="vehicle-card-horizontal"
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        />
        
        <View style={styles.overlay}>
          <View style={styles.badges}>
            <Badge
              label={vehicle.category}
              variant="info"
              size="sm"
            />
            {!vehicle.available && (
              <Badge label="Non disponible" variant="error" size="sm" />
            )}
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {vehicle.name}
                </Text>
                <Text style={styles.brand}>
                  {vehicle.brand} • {vehicle.year}
                </Text>
              </View>
            </View>

            <View style={styles.specs}>
              <View style={styles.spec}>
                <Ionicons name="speedometer-outline" size={16} color={Colors.text} />
                <Text style={styles.specText}>{vehicle.mileage.toLocaleString()} km</Text>
              </View>
              <View style={styles.spec}>
                <Ionicons
                  name={vehicle.transmission === 'auto' ? 'settings-outline' : 'hand-left-outline'}
                  size={16}
                  color={Colors.text}
                />
                <Text style={styles.specText}>
                  {vehicle.transmission === 'auto' ? 'Auto' : 'Manuel'}
                </Text>
              </View>
              <View style={styles.spec}>
                <Ionicons name="flash-outline" size={16} color={Colors.text} />
                <Text style={styles.specText}>{vehicle.fuel}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View>
                <Text style={styles.price}>{price?.toLocaleString()} DH</Text>
                {priceLabel && <Text style={styles.priceLabel}>{priceLabel}</Text>}
              </View>
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>Voir détails</Text>
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 280,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
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
    height: '70%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  content: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  brand: {
    fontSize: FontSizes.md,
    color: Colors.text,
    opacity: 0.8,
  },
  specs: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: FontSizes.xxl,
    fontWeight: '900',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  viewButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
});
