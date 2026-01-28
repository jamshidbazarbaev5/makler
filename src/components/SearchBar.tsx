import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Search, Settings } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

interface SearchBarProps {
  onFilterPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onFilterPress }) => {
  const { colors } = useTheme();

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
          Nima qidiryapsiz?
        </Text>
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
});

export default SearchBar;
