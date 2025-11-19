import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { Colors } from '../../src/constants/colors';
import { Spacing, FontSizes } from '../../src/constants/spacing';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.logo}>🚗</Text>
          <Text style={styles.title}>AutoRent Pro</Text>
          <Text style={styles.subtitle}>
            Louez ou achetez la voiture de vos rêves
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="⚡" text="Réservation instantanée" />
          <FeatureItem icon="💳" text="Paiement sécurisé" />
          <FeatureItem icon="🗺️" text="Géolocalisation en temps réel" />
          <FeatureItem icon="🔔" text="Notifications personnalisées" />
        </View>

        <View style={styles.buttons}>
          <Button
            title="Se connecter"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            size="large"
            style={styles.button}
          />
          <Button
            title="Créer un compte"
            onPress={() => router.push('/(auth)/register')}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: Spacing.xxl * 2,
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.md,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    flex: 1,
  },
  buttons: {
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
});
