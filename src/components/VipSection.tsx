import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import ListingCard from './ListingCard';
import { vipListings } from '../data/mockData';
import { useTheme } from '@react-navigation/native';

const VIPSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { colors } = useTheme();

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (220 + 12));
    setActiveIndex(Math.min(currentIndex, vipListings.length - 1));
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>
        VIP e'lonlar
      </Text>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {vipListings.map((listing: any) => (
          <View key={listing.id} style={styles.cardWrapper}>
            <ListingCard listing={listing} size="large" />
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {vipListings.map((_: any, index: number) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === activeIndex
                    ? colors.primary
                    : colors.text,
                opacity: index === activeIndex ? 1 : 0.3,
                width: index === activeIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollContainer: {
    marginHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardWrapper: {
    marginRight: 0,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
});

export default VIPSection;
