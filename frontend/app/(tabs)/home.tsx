import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSizes } from '../../src/constants/spacing';
import { HeroSlider } from '../../src/components/home/HeroSlider';
import { SectionHeader } from '../../src/components/home/SectionHeader';
import { CategoryCard } from '../../src/components/home/CategoryCard';
import { VehicleCardHorizontal } from '../../src/components/vehicle/VehicleCardHorizontal';
import { VehicleCard } from '../../src/components/vehicle/VehicleCard';
import { SearchBar } from '../../src/components/home/SearchBar';
import { EmptyState } from '../../src/components/common/EmptyState';
import { vehicleService } from '../../src/services/vehicle.service';
import { Vehicle } from '../../src/types';

const categories = [
  { name: 'SUV', icon: 'car-sport' as const, color: '#FF3B30', count: 0 },
  { name: 'Berline', icon: 'car' as const, color: '#0A84FF', count: 0 },
  { name: '4x4', icon: 'trail-sign' as const, color: '#34C759', count: 0 },
  { name: 'Sport', icon: 'speedometer' as const, color: '#FF9500', count: 0 },
  { name: 'Utilitaire', icon: 'cube' as const, color: '#8E8E93', count: 0 },
  { name: 'Autre', icon: 'ellipsis-horizontal-circle' as const, color: '#5856D6', count: 0 },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newVehicles, setNewVehicles] = useState<Vehicle[]>([]);
  const [recommendedVehicles, setRecommendedVehicles] = useState<Vehicle[]>([]);
  const [categoryCounts, setCategoryCounts] = useState(categories);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const vehicles = await vehicleService.getVehicles();
      
      // Get new vehicles (last 5)
      const sortedByDate = [...vehicles].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNewVehicles(sortedByDate.slice(0, 5));
      
      // Get recommended vehicles (random 6)
      const shuffled = [...vehicles].sort(() => 0.5 - Math.random());
      setRecommendedVehicles(shuffled.slice(0, 6));
      
      // Calculate category counts
      const counts = categories.map(cat => {
        const count = vehicles.filter(v => 
          v.category.toLowerCase().includes(cat.name.toLowerCase())
        ).length;
        return { ...cat, count };
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/(tabs)/vehicles',
      params: { category: categoryName },
    });
  };

  const handleVehiclePress = (vehicleId: string) => {
    // TODO: Navigate to vehicle detail screen (Phase 2)
    console.log('Navigate to vehicle:', vehicleId);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(tabs)/vehicles',
        params: { search: searchQuery },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(500).springify()}
          style={styles.header}
        >
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.title}>Trouvez votre véhicule</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(100).springify()}
          style={styles.section}
        >
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearchSubmit}
          />
        </Animated.View>

        {/* Hero Slider */}
        <Animated.View entering={FadeInDown.duration(500).delay(200).springify()}>
          <HeroSlider />
        </Animated.View>

        {/* Categories */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(300).springify()}
          style={styles.section}
        >
          <SectionHeader title="Catégories" />
          <View style={styles.categoriesGrid}>
            {categoryCounts.map((category, index) => (
              <Animated.View
                key={category.name}
                entering={FadeInUp.duration(400).delay(index * 50).springify()}
                style={styles.categoryItem}
              >
                <CategoryCard
                  name={category.name}
                  icon={category.icon}
                  count={category.count}
                  color={category.color}
                  onPress={() => handleCategoryPress(category.name)}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* New Vehicles */}
        {newVehicles.length > 0 && (
          <Animated.View 
            entering={FadeInDown.duration(500).delay(400).springify()}
            style={styles.section}
          >
            <SectionHeader
              title="Nouveaux véhicules"
              actionText="Voir tout"
              onActionPress={() => router.push('/(tabs)/vehicles')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {newVehicles.map((vehicle, index) => (
                <Animated.View
                  key={vehicle._id}
                  entering={FadeInUp.duration(400).delay(index * 80).springify()}
                >
                  <VehicleCardHorizontal
                    vehicle={vehicle}
                    onPress={() => handleVehiclePress(vehicle._id)}
                  />
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Recommended Vehicles */}
        {recommendedVehicles.length > 0 && (
          <Animated.View 
            entering={FadeInDown.duration(500).delay(500).springify()}
            style={[styles.section, styles.lastSection]}
          >
            <SectionHeader
              title="Recommandés pour vous"
              actionText="Voir tout"
              onActionPress={() => router.push('/(tabs)/vehicles')}
            />
            <View style={styles.recommendedGrid}>
              {recommendedVehicles.map((vehicle, index) => (
                <Animated.View
                  key={vehicle._id}
                  entering={FadeInUp.duration(400).delay(index * 60).springify()}
                  style={styles.recommendedItem}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    onPress={() => handleVehiclePress(vehicle._id)}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Empty State */}
        {newVehicles.length === 0 && recommendedVehicles.length === 0 && (
          <EmptyState
            icon="car-sport-outline"
            title="Aucun véhicule disponible"
            message="Revenez plus tard pour découvrir nos véhicules"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  greeting: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  lastSection: {
    paddingBottom: Spacing.xxl,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryItem: {
    width: '47%',
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  recommendedItem: {
    width: '47%',
  },
});
