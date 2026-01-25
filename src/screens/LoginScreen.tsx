import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  SafeAreaView,
} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {TelegramLoginButton} from '../components/TelegramLoginButton';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {colors} = useTheme();
  const {isAuthenticated, user} = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.title, {color: colors.text}]}>
            MAKLER QARAQALPAQ
          </Text>

          <Text style={[styles.subtitle, {color: colors.text}]}>
            Login to continue
          </Text>

          <View style={styles.divider} />

          <TelegramLoginButton
            onSuccess={() => {
              navigation.replace('Home');
            }}
            onError={(error) => {
              console.error('Login error:', error);
            }}
          />

          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, {color: colors.text}]}>
              Why Telegram Login?
            </Text>
            <Text style={[styles.infoText, {color: colors.text}]}>
              • Fast and secure authentication
            </Text>
            <Text style={[styles.infoText, {color: colors.text}]}>
              • No password required
            </Text>
            <Text style={[styles.infoText, {color: colors.text}]}>
              • Your Telegram account is protected
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#0088cc',
    borderRadius: 2,
    marginBottom: 40,
  },
  infoSection: {
    marginTop: 60,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
