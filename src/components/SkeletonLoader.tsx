import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '@react-navigation/native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.card,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface NotificationSkeletonProps {
  colors: any;
}

export const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({ colors }) => (
  <View
    style={[
      styles.notificationSkeletonContainer,
      { backgroundColor: colors.card, borderBottomColor: colors.border },
    ]}
  >
    <View style={styles.skeletonContent}>
      <SkeletonLoader width={48} height={48} borderRadius={8} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <SkeletonLoader width="70%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="100%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="85%" height={14} borderRadius={4} />
      </View>
    </View>
  </View>
);

export const NotificationsLoadingSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.skeletonListContainer}>
      {[1, 2, 3, 4, 5].map((index) => (
        <NotificationSkeleton key={index} colors={colors} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  skeletonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationSkeletonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  skeletonListContainer: {
    flex: 1,
    paddingBottom: 80,
  },
});

export default SkeletonLoader;
