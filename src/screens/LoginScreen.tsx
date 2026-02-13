import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {TelegramLoginButton} from '../components/TelegramLoginButton';
import { useLanguage } from '../localization';

interface LoginScreenProps {
  navigation: any;
}

const {height} = Dimensions.get('window');

export const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {colors} = useTheme();
  const { t } = useLanguage();
  const {isAuthenticated, user} = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
     
      <LinearGradient
        colors={['rgba(0, 136, 204, 0.05)', 'rgba(0, 136, 204, 0.02)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            {/* <View style={styles.logoSection}>
              <View style={[styles.logoCircle, {borderColor: colors.primary}]} />
            </View> */}

            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={[styles.title, {color: colors.text}]}>
                MAKLER
              </Text>
              <Text style={[styles.subtitle, {color: colors.text}]}>
                Qaraqalpaq
              </Text>
            </View>

            {/* Accent Line */}
            <View style={styles.accentLine} />

            {/* Description */}
            <Text style={[styles.description, {color: colors.text}]}>
              {t.auth.welcomeBack}
            </Text>

            {/* Button Section */}
            <View style={styles.buttonContainer}>
              <TelegramLoginButton
                onSuccess={() => {
                  navigation.replace('Home');
                }}
                onError={(error) => {
                  console.error('Login error:', error);
                }}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: height,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logoSection: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  titleSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.7,
  },
  accentLine: {
    width: 50,
    height: 4,
    backgroundColor: '#0088cc',
    borderRadius: 2,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 50,
    fontWeight: '400',
    opacity: 0.8,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 60,
  },
});
