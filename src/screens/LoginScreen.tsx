import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { TelegramLoginButton } from '../components/TelegramLoginButton';
import { useLanguage } from '../localization';
import { Search, PlusCircle, MessageCircle, Globe } from 'lucide-react-native';
import LanguageModal from '../components/LanguageModal';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  const features = [
    { icon: Search, label: t.auth.feature1 },
    { icon: PlusCircle, label: t.auth.feature2 },
    { icon: MessageCircle, label: t.auth.feature3 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Language Selector */}
      <View style={styles.langRow}>
        <TouchableOpacity style={styles.langButton} onPress={() => setLangModalVisible(true)}>
          <Globe size={18} color="#0088cc" strokeWidth={2} />
          <Text style={styles.langButtonText}>{language.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <LanguageModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        currentLanguage={language}
        onLanguageSelect={(lang) => setLanguage(lang)}
      />

      <LinearGradient
        colors={['rgba(0, 136, 204, 0.08)', 'rgba(0, 136, 204, 0.02)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoSection,
              {
                opacity: logoAnim,
                transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
              },
            ]}
          >
            <View style={styles.logoBox}>
              <Image source={require('../../MAINLOGO.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Makler Qaraqalpaq</Text>
          </Animated.View>

          {/* Description + Features */}
          <Animated.View
            style={[
              styles.middleSection,
              {
                opacity: contentAnim,
                transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              },
            ]}
          >
            <Text style={[styles.description, { color: colors.text }]}>
              {t.auth.loginDescription}
            </Text>

            <View style={styles.featuresContainer}>
              {features.map(({ icon: Icon, label }, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIconWrap}>
                    <Icon size={18} color="#0088cc" strokeWidth={2} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.text }]}>{label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Button + hint */}
          <Animated.View
            style={[
              styles.buttonSection,
              {
                opacity: buttonAnim,
                transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              },
            ]}
          >
            <TelegramLoginButton
              onSuccess={() => navigation.replace('Home')}
              onError={(error) => console.error('Login error:', error)}
            />
            <Text style={styles.hint}>{t.auth.whyTelegram}</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 136, 204, 0.25)',
  },
  langButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0088cc',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 32,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0088cc',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0088cc',
    marginBottom: 16,
    opacity: 0.9,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: '#0088cc',
    borderRadius: 2,
  },
  middleSection: {
    gap: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
    opacity: 0.75,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 136, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  buttonSection: {
    gap: 14,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
