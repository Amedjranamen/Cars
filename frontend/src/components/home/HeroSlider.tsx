import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - Spacing.lg * 2;

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  gradient: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Location de Voitures',
    subtitle: 'Des véhicules récents à partir de 25€/jour',
    gradient: ['#0066FF', '#0052CC'],
    icon: 'car-sport',
  },
  {
    id: '2',
    title: 'Vente de Véhicules',
    subtitle: 'Large sélection de voitures neuves et occasions',
    gradient: ['#FF9500', '#CC7700'],
    icon: 'pricetag',
  },
  {
    id: '3',
    title: 'GPS & Tracking',
    subtitle: 'Suivez votre véhicule en temps réel',
    gradient: ['#34C759', '#28A745'],
    icon: 'navigate-circle',
  },
];

export const HeroSlider: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % slides.length;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (SLIDE_WIDTH + Spacing.md),
        animated: true,
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / (SLIDE_WIDTH + Spacing.md));
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={SLIDE_WIDTH + Spacing.md}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <SlideItem
            key={slide.id}
            slide={slide}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => {
          const dotStyle = useAnimatedStyle(() => {
            const isActive = currentIndex === index;
            return {
              width: withSpring(isActive ? 24 : 8),
              opacity: withTiming(isActive ? 1 : 0.4),
            };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, dotStyle]}
            />
          );
        })}
      </View>
    </View>
  );
};

interface SlideItemProps {
  slide: Slide;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

const SlideItem: React.FC<SlideItemProps> = ({ slide, index, scrollX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (SLIDE_WIDTH + Spacing.md),
      index * (SLIDE_WIDTH + Spacing.md),
      (index + 1) * (SLIDE_WIDTH + Spacing.md),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.slideWrapper, animatedStyle]}>
      <TouchableOpacity activeOpacity={0.95}>
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.slide}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={slide.icon} size={48} color={Colors.white} />
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  slideWrapper: {
    width: SLIDE_WIDTH,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: 180,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.white,
    opacity: 0.9,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
});
