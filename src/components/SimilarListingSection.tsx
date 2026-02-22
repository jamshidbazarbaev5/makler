import React from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import SimilarListingCard, { RelatedListing } from './SimilarListingCard';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../localization/LanguageContext';

interface SimilarListingsSectionProps {
    listings: RelatedListing[];
}

const SimilarListingsSection = ({ listings }: SimilarListingsSectionProps) => {
    const navigation = useNavigation<any>();
    const { t } = useLanguage();

    if (!listings || listings.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t.listingCard.similarListings}</Text>
                <Text style={styles.count}>{listings.length} {t.listingCard.count}</Text>
            </View>

            <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <SimilarListingCard
                        listing={item}
                        onPress={() => navigation.push('ListingDetail', { listingId: item.id })}
                    />
                )}
            />
        </View>
    );
};

export default SimilarListingsSection;

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 14,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: -0.3,
    },
    count: {
        fontSize: 13,
        fontWeight: '500',
        color: '#94a3b8',
    },
    listContainer: {
        paddingHorizontal: 16,
    },
});
