import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';
import {useNavigation} from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import {useDispatch} from 'react-redux';
import {loginWithTelegram} from '../redux/slices/authSlice';
import {AppDispatch} from '../redux/store';
import CryptoJS from 'crypto-js';

const TELEGRAM_WIDGET_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        h2 { margin-bottom: 20px; color: #333; }
    </style>
</head>
<body>
    <h2>Login with Telegram</h2>
    <script async src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-login="makler_qaraqalpaq_bot"
        data-size="medium"
        data-onauth="onTelegramAuth(user)"
        data-request-access="write"></script>
    <script type="text/javascript">
      function onTelegramAuth(user) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(user));
        }
      }
    </script>
</body>
</html>
`;

export const TelegramLoginScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleData = (data: any) => {
    console.log('📦 Processing Telegram Data:', data);
    if (data.id && data.hash) {
      dispatch(loginWithTelegram(data) as any);
      navigation.goBack();
    } else {
      console.warn('❌ Missing required fields in Telegram data');
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleData(data);
    } catch (e) {
      console.error('Failed to parse Telegram data from postMessage', e);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const {url} = navState;
    console.log('🌐 Navigation state change:', url);

    // Check for tgAuthResult in the URL (hash fragment)
    if (url.includes('tgAuthResult=')) {
      try {
        // Extract the base64 string
        const regex = /tgAuthResult=([^&]+)/;
        const match = url.match(regex);

        if (match && match[1]) {
          const base64Data = decodeURIComponent(match[1]);
          // Decode
          const jsonString = CryptoJS.enc.Base64.parse(base64Data).toString(
            CryptoJS.enc.Utf8,
          );
          const data = JSON.parse(jsonString);

          handleData(data);
        }
      } catch (e) {
        console.error('Failed to parse tgAuthResult from URL', e);
      }
    }
  };

  const onShouldStartLoadWithRequest = (request: any) => {
    const {url} = request;
    console.log('🔍 Should start load with request:', url);
    
    // Allow initial HTML load
    if (url.startsWith('https://makler-qaraqalpaq.uz/') || 
        url.startsWith('about:blank') || 
        url.startsWith('data:')) {
      return true;
    }
    
    // Allow Telegram OAuth and widget resources
    if (url.includes('telegram.org') || url.includes('oauth.telegram.org')) {
      return true;
    }
    
    // Handle Telegram auth result
    if (url.includes('tgAuthResult=')) {
      handleNavigationStateChange({url});
      return false; // Prevent navigation, handle in-app
    }
    
    // Block only deep links to Telegram app, not OAuth URLs
    if (url.startsWith('telegram://') || url.startsWith('tg://')) {
      console.log('🚫 Blocking Telegram app deep link');
      return false;
    }
    
    return true;
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Telegram Login</Text>
      </View>

      <WebView
        ref={webViewRef}
        source={{
          html: TELEGRAM_WIDGET_HTML,
          baseUrl: 'https://makler-qaraqalpaq.uz/',
        }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onLoadStart={() => {
          setLoading(true);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
          setLoading(false);
        }}
        onHttpError={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
          setLoading(false);
        }}
        style={styles.webview}
        incognito={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // Allow the OAuth popup to open within WebView
        setSupportMultipleWindows={false}
        // Handle popup window requests by loading in same WebView
        onOpenWindow={syntheticEvent => {
          const {nativeEvent} = syntheticEvent;
          console.log('🪟 Opening window URL in same WebView:', nativeEvent.targetUrl);
          // Navigate to the OAuth URL in the same WebView
          if (nativeEvent.targetUrl && webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              window.location.href = '${nativeEvent.targetUrl}';
              true;
            `);
          }
        }}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0088cc" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});