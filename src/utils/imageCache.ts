import {Image} from 'react-native';

/**
 * Preload images to cache them in memory
 * This helps prevent flickering and improves performance
 */
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    Image.prefetch(url).catch(err => {
      console.warn(`Failed to preload image: ${url}`, err);
    });
  });
};

/**
 * Optimize image URL for better loading
 * Ensures consistent sizing and format
 */
export const optimizeImageUrl = (url: string, width = 400, height = 300): string => {
  if (!url) return '';
  
  // If it's already an unsplash URL, optimize it
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&h=${height}&fit=crop`;
  }
  
  // For other URLs, return as is
  return url;
};

/**
 * Get a fallback placeholder image
 */
export const getPlaceholderImage = (): string => {
  return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop';
};
