import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, Linking} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../redux/store';
import {loginWithTelegram, fetchProfile, refreshToken as refreshTokenAction} from '../redux/slices/authSlice';
import {loadFavoritesAsync} from '../redux/slices/likesSlice';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PropertyFormScreen from '../screens/PropertyFormScreen';
import PropertyTypeScreen from '../screens/PropertyTypeScreen';
import AddListingScreen from '../screens/AddListingScreen';
import LikedPostsScreen from '../screens/LikedPostsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TopPostsScreen from '../screens/TopPostsScreen';
import Profile from '../components/Profile';
import ListingDetail from '../components/ListingDetail';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import MyListingDetailScreen from '../screens/MyListingDetailScreen';
import MapScreen from '../screens/MapScreen';
import {LoginScreen} from '../screens/LoginScreen';
import {TelegramLoginScreen} from '../screens/TelegramLoginScreen';

export type RootStackParamList = {
  Login: undefined;
  TelegramLogin: undefined;
  MainApp: undefined;
  Home: undefined;
  ListingDetail: {listingId?: string; id?: string};
  MyListingDetail: {listingId: string};
  PropertyDetail: {id: string};
  AddListing: undefined;
  PropertyType: {listingType?: string};
  PropertyForm: {listingType?: string; propertyType?: string; editMode?: boolean};
  Search: undefined;
  Profile: undefined;
  ProfileEdit: undefined;
  LikedPosts: undefined;
  TopPosts: undefined;
  Notifications: undefined;
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#fff'},
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ListingDetail" component={ListingDetail} />
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#fff'},
      }}>
      {isAuthenticated ? (
        // User is logged in - show profile
        <>
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen
            name="ProfileEdit"
            component={ProfileEditScreen}
            options={{
              animation: 'default',
            }}
          />
          <Stack.Screen
            name="MyListingDetail"
            component={MyListingDetailScreen}
            options={{
              animation: 'default',
            }}
          />
        </>
      ) : (
        // User not logged in - show login screen
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

function AddListingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#fff'},
      }}>
      <Stack.Screen name="AddListing" component={AddListingScreen} />
      <Stack.Screen
        name="PropertyType"
        component={PropertyTypeScreen}
        options={{
          animation: 'default',
        }}
      />
      <Stack.Screen
        name="PropertyForm"
        component={PropertyFormScreen}
        options={{
          animation: 'default',
        }}
      />
    </Stack.Navigator>
  );
}

function MainAppNavigator() {
  return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide the built-in tab bar
        }}>
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>🏠</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>🔍</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="PropertyForm"
          component={AddListingStack}
          options={{
            tabBarLabel: 'Add',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>➕</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Messages"
          component={LikedPostsScreen}
          options={{
            tabBarLabel: 'Likes',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>❤️</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="TopPosts"
          component={TopPostsScreen}
          options={{
            tabBarLabel: 'Top',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>⭐</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>👤</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            tabBarLabel: 'Notifications',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>🔔</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
  );
}

export function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();

  // Handle deep links from Telegram authentication
  useEffect(() => {
    console.log('👂 Deep link listener initialized');
    const handleDeepLink = ({url}: {url: string}) => {
      console.log('🚀 Deep link received:', url);

      // Parse the URL: maklerapp://auth?user_id=123&first_name=Test&hash=...
      const route = url.replace(/.*?:\/\//g, '');
      const [path, queryString] = route.split('?');

      console.log('📍 Path:', path);
      console.log('❓ Query String:', queryString);

      if (path === 'auth' && queryString) {
        // Parse query parameters
        const params = new URLSearchParams(queryString);

        const telegramData = {
          id: parseInt(params.get('user_id') || params.get('id') || '0'),
          first_name: params.get('first_name') || '',
          last_name: params.get('last_name') || undefined,
          username: params.get('username') || undefined,
          photo_url: params.get('photo_url') || undefined,
          auth_date: parseInt(params.get('auth_date') || '0'),
          hash: params.get('hash') || '',
        };

        console.log('📦 Telegram data parsed:', JSON.stringify(telegramData, null, 2));

        // Dispatch login action with real Telegram data
        if (telegramData.id && telegramData.hash) {
          console.log('✅ Dispatching loginWithTelegram action...');
          dispatch(loginWithTelegram(telegramData) as any);
        } else {
          console.error('❌ Missing required fields (id or hash). Data invalid.');
        }
      } else {
         console.log('⚠️ Unknown path or missing query string');
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (when app is launched from a deep link)
    Linking.getInitialURL().then(url => {
      if (url != null) {
        handleDeepLink({url});
      }
    });

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  // If we have a token persisted but no user object, fetch profile once rehydrated
  const {token, user, refreshToken: storedRefreshToken} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && !user) {
      console.log('♻️ Token present after rehydrate — fetching profile');
      dispatch(fetchProfile() as any);
      // Load favorites when token is available
      dispatch(loadFavoritesAsync() as any);
      return;
    }

    // If we don't have access token but have a refresh token, try to refresh it
    if (!token && storedRefreshToken) {
      console.log('🔁 No access token but refresh token found — attempting refresh');
      dispatch(refreshTokenAction(storedRefreshToken) as any)
        .then((action: any) => {
          if (action.payload?.success) {
            console.log('✅ Token refresh succeeded — fetching profile');
            dispatch(fetchProfile() as any);
            // Load favorites after token refresh
            dispatch(loadFavoritesAsync() as any);
          } else {
            console.log('❌ Token refresh failed during startup');
          }
        })
        .catch((err: any) => {
          console.log('❌ Refresh token flow error:', err);
        });
    }
  }, [dispatch, token, user, storedRefreshToken]);

  // Always show MainApp - Login is only shown in Profile stack if not authenticated
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen
        name="MainApp"
        component={MainAppNavigator}
        options={{
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="TelegramLogin"
        component={TelegramLoginScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
