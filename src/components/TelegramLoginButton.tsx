import React, {useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootState} from '../redux/store';
import {RootStackParamList} from '../navigation/RootNavigator';

interface TelegramLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={handleTelegramLogin}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleTelegramLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login with Telegram</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#0088cc',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 250,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorButton: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
  },
});
