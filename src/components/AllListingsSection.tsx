import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import ListingCard from './ListingCard'
import { allListings, totalListingsCount } from '../data/mockData';
import { useTheme } from '@react-navigation/native';

const AllListingsSection = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const numColumns = 2;
  const columnWidth = useMemo(() => (width - 48) / numColumns, [width]);

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
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Barcha e'lonlar {totalListingsCount.toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.sortButton, { borderBottomColor: colors.border }]}
        activeOpacity={0.6}
      >
        <ChevronDown
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
        nestedScrollEnabled={true}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.columnWrapper}
        scrollIndicatorInsets={Platform.OS === 'android' ? { right: 1 } : {}}
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
    paddingVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  gridContainer: {
    gap: 12,
    paddingTop: 12,
  },
  columnWrapper: {
    gap: 12,
    marginHorizontal: 0,
  },
  cardContainer: {
    flex: 1,
  },
});

export default AllListingsSection;
