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
  const { t, language } = useLanguage();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  // Translate notification message while preserving the property title
  const translateMessage = (message: string): string => {
    // EN approved
    const approvedEnPattern = /Your post "([^"]+)" has been approved and is now live!/;
    const approvedEnMatch = message.match(approvedEnPattern);
    if (approvedEnMatch) {
      const postTitle = approvedEnMatch[1];
      return (t.notifications as any).postApprovedWithTitle
        ? (t.notifications as any).postApprovedWithTitle.replace('{title}', postTitle)
        : message;
    }

    // EN rejected
    const rejectedEnPattern = /Your post "([^"]+)" was rejected\. Reason: (.+)/;
    const rejectedEnMatch = message.match(rejectedEnPattern);
    if (rejectedEnMatch) {
      const postTitle = rejectedEnMatch[1];
      const reason = rejectedEnMatch[2];
      return (t.notifications as any).postRejectedWithTitle
        ? (t.notifications as any).postRejectedWithTitle
            .replace('{title}', postTitle)
            .replace('{reason}', reason)
        : message;
    }

    // RU payment success
    const paymentRuPattern = /Платеж за "([^"]+)" принят\. Объявление отправлено на модерацию\.?/i;
    const paymentRuMatch = message.match(paymentRuPattern);
    if (paymentRuMatch) {
      const postTitle = paymentRuMatch[1];
      return (t.notifications as any).paymentSuccessWithTitle
        ? (t.notifications as any).paymentSuccessWithTitle.replace('{title}', postTitle)
        : message;
    }

    // EN payment success
    const paymentEnPattern = /Payment for "([^"]+)" (was )?successful\.?/i;
    const paymentEnMatch = message.match(paymentEnPattern);
    if (paymentEnMatch) {
      const postTitle = paymentEnMatch[1];
      return (t.notifications as any).paymentSuccessWithTitle
        ? (t.notifications as any).paymentSuccessWithTitle.replace('{title}', postTitle)
        : message;
    }

    return message;
  };

  // Translate notification title
  const translateTitle = (title: string, type: string): string => {
    if (type === 'post_approved') {
      return t.notifications.postPublished;
    } else if (type === 'post_rejected') {
      return t.notifications.postRejected;
    } else if (type === 'payment_success') {
      return (t.notifications as any).paymentSuccess || title;
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
      case 'payment_success':
        return <CheckCircle size={24} color="#3b82f6" />;
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
        case 'payment_success':
          return '#eff6ff';
        default:
          return '#f9fafb';
      }
    }
    return colors.background;
  };

  // Map app language to locale code for date formatting
  const getLocaleCode = (lang: string): string => {
    const localeMap: Record<string, string> = {
      uz: 'uz-UZ',
      ru: 'ru-RU',
      en: 'en-US',
      kaa: 'kk-KZ',
    };
    return localeMap[lang] || 'en-US';
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
      return t.notifications.justNow;
    } else if (diffMins < 60) {
      return `${diffMins} ${t.notifications.minutesAgo}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t.notifications.hoursAgo}`;
    } else if (diffDays < 7) {
      return `${diffDays} ${t.notifications.daysAgo}`;
    } else {
      return date.toLocaleDateString(getLocaleCode(language), {
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