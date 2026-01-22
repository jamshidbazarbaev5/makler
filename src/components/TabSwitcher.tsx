import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

interface TabSwitcherProps {
  activeTab: 'gallery' | 'map';
  onTabChange: (tab: 'gallery' | 'map') => void;
}

const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  const {colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'gallery' && [
            styles.activeTab,
            { borderBottomColor: colors.primary },
          ],
        ]}
        onPress={() => onTabChange('gallery')}
      >
        <Ionicons
          name="grid"
          size={20}
          color={activeTab === 'gallery' ? colors.primary : colors.text}
        />
        <Text
          style={[
            styles.tabText,
            {
              color: activeTab === 'gallery' ? colors.primary : colors.text,
            },
          ]}
        >
          Galereya
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'map' && [
            styles.activeTab,
            { borderBottomColor: colors.primary },
          ],
        ]}
        onPress={() => onTabChange('map')}
      >
        <Ionicons
          name="map"
          size={20}
          color={activeTab === 'map' ? colors.primary : colors.text}
        />
        <Text
          style={[
            styles.tabText,
            {
              color: activeTab === 'map' ? colors.primary : colors.text,
            },
          ]}
        >
          Xaritada
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TabSwitcher;
