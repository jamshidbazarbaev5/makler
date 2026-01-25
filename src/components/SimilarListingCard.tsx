import React, { useState } from 'react';
import { Image, Text, View, StyleSheet, Animated, Pressable } from 'react-native';
import { ImageIcon, Heart } from 'lucide-react-native';
import { Listing } from '../data/mockData';

interface SimilarListingCardProps {
    listing: Listing;
    onPress?: () => void;
}

const SimilarListingCard = ({ listing, onPress }: SimilarListingCardProps) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    const [isLiked, setIsLiked] = useState(false);

    const handlePressIn = () => {
        Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
        onPress?.();
    };

    const handleLike = (e: any) => {
        e.stopPropagation?.();
        setIsLiked(!isLiked);
    };

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.pressable}
            >
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
                            <ImageIcon size={32} color="#cbd5e1" strokeWidth={1.5} />
                        </View>
                    )}

                    {/* Gradient overlay */}
                    <View style={styles.gradientOverlay} />

                    {/* Like Button */}
                    <Pressable 
                        style={styles.likeButton}
                        onPress={handleLike}
                    >
                        <Heart
                            size={20}
                            color="#fff"
                            fill={isLiked ? '#ff6b6b' : 'none'}
                            strokeWidth={2}
                        />
                    </Pressable>

                    {/* User Badge */}
                    <View style={styles.userBadge}>
                        <Image source={{ uri: listing.avatar }} style={styles.userAvatar} />
                        <Text style={styles.userText} numberOfLines={1}>{listing.username}</Text>
                    </View>

                    {/* Content overlay */}
                    <View style={styles.contentOverlay}>
                        <Text style={styles.price}>{listing.price}</Text>
                        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
};

export default SimilarListingCard;

const styles = StyleSheet.create({
    card: {
        minWidth: 180,
        width: 180,
        borderRadius: 16,
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        marginRight: 12,
    },
    pressable: {
        flex: 1,
    },
    imageContainer: {
        height: 220,
        position: 'relative',
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
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    likeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    userBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    userAvatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#e2e8f0',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    userText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
        maxWidth: 90,
    },
    contentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        gap: 4,
    },
    price: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    title: {
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 16,
    },
});

// Note: For the gradient, you might want to use react-native-linear-gradient
// import LinearGradient from 'react-native-linear-gradient';
// And replace the gradientOverlay View with:
// <LinearGradient
//   colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
//   style={styles.gradientOverlay}
// />
