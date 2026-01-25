import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Search, Settings } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';

interface SearchBarProps {
  onFilterPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onFilterPress }) => {
  const [searchText, setSearchText] = useState('');
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: 16, paddingVertical: 8 }]}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Search
          size={20}
          color={colors.text}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
          ]}
          placeholder="Nima qidiryapsiz?"
          placeholderTextColor={colors.text}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onFilterPress}
        >
          <Settings
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
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
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  filterButton: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    marginLeft: 8,
  },
});

export default SearchBar;
