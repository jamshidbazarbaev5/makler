import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text} from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PropertyFormScreen from '../screens/PropertyFormScreen';
import MessagesScreen from '../screens/MessagesScreen';
import Profile from '../components/Profile';
import ListingDetail from '../components/ListingDetail';

export type RootStackParamList = {
  Home: undefined;
  PropertyDetail: {id: string};
  PropertyForm: {id?: string};
  Search: undefined;
  Profile: undefined;
  Messages: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#fff'},
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ListingDetail" component={ListingDetail} />
    </Stack.Navigator>
  );
}



export function RootNavigator() {
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
          component={PropertyFormScreen}
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
          component={MessagesScreen}
          options={{
            tabBarLabel: 'Messages',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>💬</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({color}) => (
              <View style={{width: 24, height: 24, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color, fontSize: 20}}>👤</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
  );
}
