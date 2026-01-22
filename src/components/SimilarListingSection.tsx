import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Listing } from '../data/mockData';
import SimilarListingCard from './SimilarListingCard';

interface SimilarListingsSectionProps {
    listings: Listing[];
}

const SimilarListingsSection = ({ listings }: SimilarListingsSectionProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 2;
    const totalPages = Math.ceil(listings.length / itemsPerPage);

    const visibleListings = listings.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Shunga o'xshash e'lonlar</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {visibleListings.map((listing) => (
                    <SimilarListingCard key={listing.id} listing={listing} />
                ))}
            </ScrollView>

            {/* Pagination */}
            {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setCurrentPage(index)}
                            style={[
                                styles.paginationButton,
                                currentPage === index ? styles.paginationButtonActive : styles.paginationButtonInactive,
                            ]}
                            activeOpacity={0.7}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

export default SimilarListingsSection;

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 16,
    },
    scrollContainer: {
        paddingRight: 16,
        paddingBottom: 8,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
    },
    paginationButton: {
        height: 4,
        borderRadius: 2,
    },
    paginationButtonActive: {
        width: 32,
        backgroundColor: '#0f172a',
    },
    paginationButtonInactive: {
        width: 16,
        backgroundColor: 'rgba(100, 116, 139, 0.3)'
    },
});
