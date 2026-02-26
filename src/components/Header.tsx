import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme, useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const Header = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const fetchUnreadCount = async () => {
    try {
      const data = await api.getNotificationsCount();
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      // silently fail
    }
  };

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.brandButton}
          onPress={() => navigation.getParent()?.navigate('TopPostsTab' as any)}
        >
          <Image source={require('../../MAINLOGO.png')} style={styles.logo} resizeMode="contain" />
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            MAKLER QARAQALPAQ
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={[
            styles.topBadge,
            { backgroundColor: colors.text },
          ]}
          onPress={() => navigation.getParent()?.navigate('TopPostsTab' as any)}
        >
          <Text style={[styles.topBadgeText, { color: colors.card }]}>TOP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => navigation.getParent()?.navigate('Notifications' as any)}
        >
          <Bell size={24} color={colors.text} />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 34,
    height: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  bellContainer: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ef4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});

export default Header;
