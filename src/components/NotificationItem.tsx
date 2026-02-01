import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  Heart,
  Home,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
  onSwipe?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onSwipe,
}) => {
  const { colors } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  // Get appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={24} color="#10b981" />;
      case 'warning':
        return <AlertCircle size={24} color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={24} color="#ef4444" />;
      case 'new_listing':
        return <Home size={24} color="#3b82f6" />;
      case 'message':
        return <MessageSquare size={24} color="#8b5cf6" />;
      case 'like':
        return <Heart size={24} color="#ec4899" />;
      case 'booking':
        return <Calendar size={24} color="#0ea5e9" />;
      default:
        return <Info size={24} color="#6b7280" />;
    }
  };

  // Get appropriate background color based on notification type and read status
  const getBackgroundColor = () => {
    if (!notification.read) {
      switch (notification.type) {
        case 'success':
          return '#f0fdf4';
        case 'warning':
          return '#fffbeb';
        case 'error':
          return '#fef2f2';
        case 'new_listing':
          return '#eff6ff';
        case 'message':
          return '#f5f3ff';
        case 'like':
          return '#fdf2f8';
        case 'booking':
          return '#f0f9ff';
        default:
          return '#f9fafb';
      }
    }
    return colors.background;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const backgroundColor = getBackgroundColor();
  const icon = getIcon();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderLeftColor: notification.read ? 'transparent' : colors.primary,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -Dimensions.get('window').width],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Left Icon Section */}
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: notification.read
                  ? colors.card
                  : `${colors.primary}15`,
              },
            ]}
          >
            {icon}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontWeight: notification.read ? '400' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text style={[styles.time, { color: colors.text + '80' }]}>
              {formatTime(notification.timestamp)}
            </Text>
          </View>

          <Text
            style={[
              styles.message,
              {
                color: colors.text + 'CC',
                fontWeight: notification.read ? '400' : '500',
              },
            ]}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          {/* Unread indicator */}
          {!notification.read && (
            <View
              style={[
                styles.unreadDot,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            />
          )}
        </View>

        {/* Right Chevron */}
        <View style={styles.chevronContainer}>
          <ChevronRight size={20} color={colors.text + '60'} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    borderLeftWidth: 4,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chevronContainer: {
    paddingLeft: 8,
  },
});

export default NotificationItem;