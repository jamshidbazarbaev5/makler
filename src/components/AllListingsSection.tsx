import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ListingCard from './ListingCard'
import { allListings, totalListingsCount } from '../data/mockData';
import { useTheme } from '@react-navigation/native';

const AllListingsSection = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const numColumns = 2;
  const columnWidth = (width - 48) / numColumns;

  const renderListingCard = ({ item }: { item: any }) => (
    <View
      style={[
        styles.cardContainer,
        { width: columnWidth },
      ]}
    >
      <ListingCard listing={item} />
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Barcha e'lonlar {totalListingsCount.toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity style={styles.sortButton}>
        <Ionicons
          name="chevron-down"
          size={16}
          color={colors.text}
          style={{ opacity: 0.6 }}
        />
        <Text
          style={[
            styles.sortText,
            { color: colors.text },
          ]}
        >
          Saralash: Standart bo'yicha
        </Text>
      </TouchableOpacity>

      <FlatList
        data={allListings}
        renderItem={renderListingCard}
        keyExtractor={(item: any) => item.id.toString()}
        numColumns={numColumns}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sortText: {
    fontSize: 14,
  },
  gridContainer: {
    gap: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  cardContainer: {
    flex: 1,
  },
});

export default AllListingsSection;
