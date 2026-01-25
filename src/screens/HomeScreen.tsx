import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Header from '../components/Header'
import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import VIPSection from '../components/VipSection'
import AllListingsSection from '../components/AllListingsSection';
import BottomNav from '../components/BottomNav';
import { FilterModal } from '../components/FilterModal';
import { useTheme } from '@react-navigation/native';
import { FilterState } from '../types';

const HomeScreen = () => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState | null>(null);
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header />
      <SearchBar onFilterPress={() => setFilterModalVisible(true)} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
       
          <View>
            {/* <VIPSection /> */}
            <AllListingsSection />
          </View>
       
      </ScrollView>
      <BottomNav/>
      <FilterModal
        isOpen={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          setFilterModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 70,
  },
  mapPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    opacity: 0.5,
  },
});

export default HomeScreen;
