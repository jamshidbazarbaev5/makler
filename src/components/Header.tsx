import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <View style={styles.leftSection}>
     
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('TopPosts' as any)}>
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
            styles.badge,
            { backgroundColor: colors.text },
          ]}
          onPress={() => navigation.getParent()?.navigate('TopPosts' as any)}
        >
          <Text style={[styles.badgeText, { color: colors.card }]}>TOP</Text>
          {/* <Text style={[styles.badgeNumber, { color: colors.card }]}>10</Text> */}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Notifications' as any)}>
          <Bell size={24} color={colors.text} />
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
  logo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 28,
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
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeNumber: {
    fontSize: 8,
    fontWeight: 'bold',
    position: 'absolute',
    marginTop: 12,
  },
});

export default Header;
