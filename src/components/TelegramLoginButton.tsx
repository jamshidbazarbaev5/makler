import React, {useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootState} from '../redux/store';
import {RootStackParamList} from '../navigation/RootNavigator';

interface TelegramLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const {width} = Dimensions.get('window');

/**
 * Telegram Login Button Component
 * Opens an in-app browser (WebView) to handle Telegram authentication
 */
export const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  onSuccess,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {loading, error, isAuthenticated} = useSelector((state: RootState) => state.auth);

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      onSuccess?.();
    }
  }, [isAuthenticated, onSuccess]);

  const handleTelegramLogin = () => {
    // Open the Telegram Login Screen (WebView)
    navigation.navigate('TelegramLogin');
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <LinearGradient
          colors={['#ff6b6b', '#ff4757']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={styles.buttonContent}
            onPress={handleTelegramLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Yana Urinib Ko'ring</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0088cc', '#0077b6']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.buttonGradient}
      >
        <TouchableOpacity
          style={[
            styles.buttonContent,
            loading && styles.buttonContentDisabled,
          ]}
          onPress={handleTelegramLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Telegram orqali kirish</Text>
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGradient: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContentDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
