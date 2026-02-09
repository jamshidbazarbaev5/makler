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
import { useLanguage } from '../localization/LanguageContext';

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
  const { t } = useLanguage();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  // Translate notification message while preserving the property title
  const translateMessage = (message: string): string => {
    // Pattern for approved posts: Your post "TITLE" has been approved and is now live!
    const approvedPattern = /Your post "([^"]+)" has been approved and is now live!/;
    const approvedMatch = message.match(approvedPattern);
    if (approvedMatch) {
      const postTitle = approvedMatch[1];
      return t.postApprovedMessage(postTitle);
    }

    // Pattern for rejected posts: Your post "TITLE" was rejected. Reason: REASON
    const rejectedPattern = /Your post "([^"]+)" was rejected\. Reason: (.+)/;
    const rejectedMatch = message.match(rejectedPattern);
    if (rejectedMatch) {
      const postTitle = rejectedMatch[1];
      const reason = rejectedMatch[2];
      return t.postRejectedMessage(postTitle, reason);
    }

    // If no pattern matches, return original message
    return message;
  };

  // Translate notification title
  const translateTitle = (title: string, type: string): string => {
    if (type === 'post_approved') {
      return t.postPublished;
    } else if (type === 'post_rejected') {
      return t.postRejected;
    }
    return title;
  };

  // Get appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.notification_type) {
      case 'post_approved':
        return <CheckCircle size={24} color="#10b981" />;
      case 'post_rejected':
        return <AlertCircle size={24} color="#ef4444" />;
      default:
        return <Info size={24} color="#6b7280" />;
    }
  };

  // Get appropriate background color based on notification type and read status
  const getBackgroundColor = () => {
    if (!notification.is_read) {
      switch (notification.notification_type) {
        case 'post_approved':
          return '#f0fdf4';
        case 'post_rejected':
          return '#fef2f2';
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

  const timestamp = notification.created_at || notification.read_at || new Date().toISOString();

  const backgroundColor = getBackgroundColor();
  const icon = getIcon();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          borderLeftColor: notification.is_read ? 'transparent' : colors.primary,
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
                backgroundColor: notification.is_read
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
                  fontWeight: notification.is_read ? '400' : '600',
                },
              ]}
              numberOfLines={1}
            >
              {translateTitle(notification.title, notification.notification_type)}
            </Text>
            <Text style={[styles.time, { color: colors.text + '80' }]}>
              {formatTime(timestamp)}
            </Text>
          </View>

          <Text
            style={[
              styles.message,
              {
                color: colors.text + 'CC',
                fontWeight: notification.is_read ? '400' : '500',
              },
            ]}
            numberOfLines={2}
          >
            {translateMessage(notification.message)}
          </Text>

          {/* Unread indicator */}
          {!notification.is_read && (
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