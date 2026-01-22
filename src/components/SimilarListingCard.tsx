import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Listing } from '../data/mockData';

interface SimilarListingCardProps {
    listing: Listing;
}

const SimilarListingCard = ({ listing }: SimilarListingCardProps) => {
    return (
        <View style={styles.card}>
            {/* Image */}
            <View style={styles.imageContainer}>
                {listing.hasImage && listing.imageUrl ? (
                    <Image
                        source={{ uri: listing.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Icon name="image" size={24} color="#94a3b8" />
                    </View>
                )}

                {/* Gradient overlay */}
                <View style={styles.gradientOverlay} />

                {/* User Badge */}
                <View style={styles.userBadge}>
                    <Image source={{ uri: listing.avatar }} style={styles.userAvatar} />
                    <Text style={styles.userText} numberOfLines={1}>{listing.username}</Text>
                </View>

                {/* Content overlay */}
                <View style={styles.contentOverlay}>
                    <Text style={styles.price}>{listing.price}</Text>
                    <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
                </View>
            </View>
        </View>
    );
};

export default SimilarListingCard;

const styles = StyleSheet.create({
    card: {
        minWidth: 160,
        width: 160,
        borderRadius: 12,
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    imageContainer: {
        height: 176,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    userBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    userAvatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#e2e8f0',
    },
    userText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
        maxWidth: 80,
    },
    contentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
    },
    price: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    title: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
});

// Note: For the gradient, you might want to use react-native-linear-gradient
// import LinearGradient from 'react-native-linear-gradient';
// And replace the gradientOverlay View with:
// <LinearGradient
//   colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
//   style={styles.gradientOverlay}
// />
