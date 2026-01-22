import React, { useState, useMemo } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import SearchHeader from '../components/SearchHeader';
import UsersList from '../components/UsersList';
import BottomNav from '../components/BottomNav';
import { UserProfile } from '../types';
import { MOCK_USERS } from '../data/mockData';

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

const SearchScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top: Search Section */}
      <SearchHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* Middle: Users List Section */}
      <View style={styles.content}>
        <UsersList users={filteredUsers} />
      </View>

      {/* Bottom: Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
};

export default SearchScreen;

