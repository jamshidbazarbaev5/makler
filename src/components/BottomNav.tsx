import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Home, MapPin, PlusCircle, HeartIcon, User } from 'lucide-react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useLanguage } from '../localization';
import { COLORS } from '../constants';

interface NavItem {
  icon: any;
  labelKey: 'home' | 'map' | 'add' | 'favorites' | 'profile';
  route: string;
}

const BottomNav = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Find the tab navigator by walking up the parent chain
  const getTabNavigator = () => {
    let nav = navigation;
    for (let i = 0; i < 5; i++) {
      const state = nav.getState?.();
      if (state?.type === 'tab') return nav;
      const parent = nav.getParent?.();
      if (!parent) break;
      nav = parent;
    }
    return null;
  };

  useEffect(() => {
    const tabNav = getTabNavigator();
    if (!tabNav) return;

    // Read initial state
    const state = tabNav.getState?.();
    if (state) {
      setActiveTab(state.routes[state.index ?? 0]?.name ?? null);
    }

    // Listen for tab changes
    const unsubscribe = tabNav.addListener('state', (e: any) => {
      const newState = e.data?.state;
      if (newState) {
        setActiveTab(newState.routes[newState.index ?? 0]?.name ?? null);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const navItems: NavItem[] = [
    { icon: Home, labelKey: 'home', route: 'HomeTab' },
    { icon: MapPin, labelKey: 'map', route: 'MapTab' },
    { icon: PlusCircle, labelKey: 'add', route: 'PropertyForm' },
    { icon: HeartIcon, labelKey: 'favorites', route: 'Messages' },
    { icon: User, labelKey: 'profile', route: 'Profile' },
  ];

  const isActive = (route: string) => {
    return activeTab === route;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.navContainer}>
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          const active = isActive(item.route);
          return (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => {
              if (item.route) {
                navigation.navigate(item.route as never);
              }
            }}
          >
            <View style={styles.iconContainer}>
              <IconComponent
                size={24}
                color={active ? COLORS.purple : '#94a3b8'}
              />
              {active && <View style={styles.activeIndicator} />}
            </View>
            <Text
              style={[
                styles.navLabel,
                {
                  color: active ? COLORS.purple : '#94a3b8',
                  fontWeight: active ? '600' : '500',
                },
              ]}
            >
              {t.bottomNav?.[item.labelKey] || item.labelKey}
            </Text>
          </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  iconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.purple,
  },
  navLabel: {
    fontSize: 10,
  },
});

export default BottomNav;
