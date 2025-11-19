import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';
import { Vehicle } from '../../types';
import { Badge } from '../common/Badge';

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const price = vehicle.type === 'vente'
    ? vehicle.price_sale
    : vehicle.price_per_day;

  const priceLabel = vehicle.type === 'vente'
    ? `${price?.toLocaleString()}€`
    : `${price}€/jour`;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          {vehicle.images && vehicle.images.length > 0 ? (
            <Image
              source={{ uri: vehicle.images[0] }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="car-sport" size={48} color={Colors.textSecondary} />
            </View>
          )}
          
          {/* Badge Type */}
          <View style={styles.badge}>
            <Badge
              text={vehicle.type === 'vente' ? 'VENTE' : 'LOCATION'}
              variant={vehicle.type === 'vente' ? 'primary' : 'success'}
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {vehicle.name}
          </Text>
          <Text style={styles.brand} numberOfLines={1}>
            {vehicle.brand}
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
                name={vehicle.transmission === 'auto' ? 'cog-outline' : 'settings-outline'}
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
            <Text style={styles.price}>{priceLabel}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
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
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  brand: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  features: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  price: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});
