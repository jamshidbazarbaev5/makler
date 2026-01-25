import React, { useRef } from 'react';
import { Text, View, ScrollView, StyleSheet, Animated } from 'react-native';
import { Listing } from '../data/mockData';
import SimilarListingCard from './SimilarListingCard';

interface SimilarListingsSectionProps {
    listings: Listing[];
}

const SimilarListingsSection = ({ listings }: SimilarListingsSectionProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Shunga o'xshash e'lonlar</Text>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                decelerationRate="fast"
                snapToInterval={192}
                snapToAlignment="start"
            >
                {listings.map((listing) => (
                    <SimilarListingCard key={listing.id} listing={listing} />
                ))}
            </ScrollView>
        </View>
    );
};

export default SimilarListingsSection;

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
        marginLeft: 16,
        letterSpacing: -0.3,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 0,
    },
});
