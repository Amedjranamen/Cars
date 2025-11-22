import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';
import { Button } from '../common/Button';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - Spacing.lg * 2;
const ITEM_WIDTH = SLIDER_WIDTH;

const slides = [
  {
    id: '1',
    title: 'Trouvez votre véhicule idéal',
    subtitle: 'Location et vente de voitures de luxe',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    gradient: ['rgba(0, 102, 255, 0.9)', 'rgba(0, 0, 0, 0.7)'],
  },
  {
    id: '2',
    title: 'Les meilleurs prix',
    subtitle: 'Des offres exclusives sur tous nos véhicules',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    gradient: ['rgba(255, 149, 0, 0.9)', 'rgba(0, 0, 0, 0.7)'],
  },
  {
    id: '3',
    title: 'Service premium',
    subtitle: 'Support 24/7 et livraison à domicile',
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800&q=80',
    gradient: ['rgba(52, 199, 89, 0.9)', 'rgba(0, 0, 0, 0.7)'],
  },
];

export const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => (
    <View style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <LinearGradient colors={item.gradient} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Button
            title="Découvrir"
            onPress={() => console.log('Discover')}
            variant="primary"
            icon="arrow-forward"
            iconPosition="right"
            style={styles.button}
          />
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }}
          >
            <View
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 320,
    marginBottom: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
  },
  slide: {
    width: ITEM_WIDTH,
    height: 320,
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
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: Spacing.xl,
  },
  content: {
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: '900',
    color: Colors.white,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.white,
    opacity: 0.9,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  pagination: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.xl,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    opacity: 0.4,
  },
  dotActive: {
    width: 24,
    opacity: 1,
  },
});
