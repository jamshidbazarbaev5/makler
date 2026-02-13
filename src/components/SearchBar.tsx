import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Search, Settings, Map } from 'lucide-react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { useLanguage } from '../localization';

interface SearchBarProps {
  onFilterPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onFilterPress }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { paddingHorizontal: 16, paddingVertical: 8 }]}>
      <TouchableOpacity
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <Search
          size={20}
          color={colors.text}
          style={styles.searchIcon}
        />
        <Text
          style={[
            styles.placeholder,
            { color: colors.text },
          ]}
        >
          {t.search.searchPlaceholder}
        </Text>
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: '#6366f1' }]}
          onPress={() => navigation.navigate('Map')}
        >
          <Map
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onFilterPress}
        >
          <Settings
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    opacity: 0.6,
  },
  filterButton: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    marginLeft: 8,
  },
  mapButton: {
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
});

export default SearchBar;
