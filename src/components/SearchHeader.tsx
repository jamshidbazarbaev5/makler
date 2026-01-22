import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (text: string) => void;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
});

const SearchHeader: React.FC<SearchHeaderProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Search size={20} color="#999" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Profil nomini kiriting"
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};

export default SearchHeader;
