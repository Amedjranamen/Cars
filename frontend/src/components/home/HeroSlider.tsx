import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../../constants/spacing';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - Spacing.lg * 2;
const SLIDE_HEIGHT = 180;

const slides = [
  {
    id: '1',
    title: 'Location de Luxe',
    subtitle: 'Réservez votre véhicule premium',
    color: '#FF3B30',
    gradient: ['#FF3B30', '#FF6B30'],
  },
  {
    id: '2',
    title: 'Vente Exclusive',
    subtitle: 'Des véhicules d\'exception à votre portée',
    color: '#0A84FF',
    gradient: ['#0A84FF', '#3385FF'],
  },
  {
    id: '3',
    title: 'GPS Tracking',
    subtitle: 'Suivez votre véhicule en temps réel',
    color: '#34C759',
    gradient: ['#34C759', '#5FD77E'],
  },
];

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex]);

  const startAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
  };

  useEffect(() => {
    translateX.value = withSpring(-currentIndex * (SLIDE_WIDTH + Spacing.md), {
      damping: 20,
      stiffness: 90,
    });
  }, [currentIndex]);

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    startAutoPlay();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Animated.View style={[styles.slidesWrapper, animatedStyle]}>
          {slides.map((slide, index) => {
            return (
              <TouchableOpacity
                key={slide.id}
                activeOpacity={0.9}
                style={styles.slide}
              >
                <LinearGradient
                  colors={slide.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.slideGradient}
                >
                  <View style={styles.slideContent}>
                    <Text style={styles.slideTitle}>{slide.title}</Text>
                    <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  sliderContainer: {
    height: SLIDE_HEIGHT,
    overflow: 'hidden',
  },
  slidesWrapper: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
  },
  slide: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  slideGradient: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  slideContent: {
    gap: Spacing.xs,
  },
  slideTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  slideSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.white,
    opacity: 0.9,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dot: {
    height: 8,
    borderRadius: BorderRadius.full,
    transition: 'all 0.3s',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.textSecondary,
    opacity: 0.5,
  },
});