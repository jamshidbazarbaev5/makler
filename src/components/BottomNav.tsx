import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Home, Search, PlusCircle, MessageCircle, User, HeartIcon, Bell } from 'lucide-react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useLanguage } from '../localization';

interface NavItem {
  icon: any;
  labelKey: 'home' | 'add' | 'favorites' | 'profile';
  route: string;
}

const BottomNav = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { icon: Home, labelKey: 'home', route: 'HomeTab' },
    { icon: PlusCircle, labelKey: 'add', route: 'PropertyForm' },
    { icon: HeartIcon, labelKey: 'favorites', route: 'Messages' },
    { icon: User, labelKey: 'profile', route: 'Profile' },
  ];

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
            <IconComponent
              size={24}
              color={colors.text}
            />
            <Text
              style={[
                styles.navLabel,
                {
                  color: colors.text,
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  activeNavItem: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});

export default BottomNav;
