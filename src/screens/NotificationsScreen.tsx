import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Bell, CheckCircle, Filter, Trash2, ArrowLeft } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import BottomNav from '../components/BottomNav';
import NotificationItem from '../components/NotificationItem';
import { NotificationsLoadingSkeleton } from '../components/SkeletonLoader';
import {
  fetchNotifications,
  markAllAsRead,
  clearAllNotifications,
  deleteNotification,
  markAsRead,
} from '../redux/slices/notificationsSlice';
import { COLORS } from '../constants';
import { Notification } from '../types';

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading, error } = useAppSelector(
    (state) => state.notifications
  );

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') {
      return !notification.read;
    }
    return true;
  });

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      await dispatch(fetchNotifications()).unwrap();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      // Mark as read if not already read
      if (!notification.read) {
        try {
          await dispatch(markAsRead(notification.id)).unwrap();
        } catch (err) {
          console.error('Failed to mark as read:', err);
        }
      }

      // Handle navigation or action based on notification type
      if (notification.actionUrl) {
        // Navigate to action URL
        console.log('Navigate to:', notification.actionUrl);
      }
    },
    [dispatch]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    Alert.alert(
      'Mark all as read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as read',
          style: 'default',
          onPress: async () => {
            try {
              await dispatch(markAllAsRead()).unwrap();
            } catch (err) {
              console.error('Failed to mark all as read:', err);
            }
          },
        },
      ]
    );
  }, [dispatch, unreadCount]);

  const handleClearAll = useCallback(() => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Clear all notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: () => {
            dispatch(clearAllNotifications());
          },
        },
      ]
    );
  }, [dispatch, notifications.length]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedNotifications.length === 0) return;

    Alert.alert(
      'Delete selected',
      `Are you sure you want to delete ${selectedNotifications.length} notification(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedNotifications) {
              try {
                await dispatch(deleteNotification(id)).unwrap();
              } catch (err) {
                console.error('Failed to delete notification:', err);
              }
            }
            setSelectedNotifications([]);
          },
        },
      ]
    );
  }, [dispatch, selectedNotifications]);

  const toggleNotificationSelection = useCallback((id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((notificationId) => notificationId !== id)
        : [...prev, id]
    );
  }, []);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: colors.card },
        ]}
      >
        <Bell size={48} color={colors.text + '80'} />
      </View>
      <Text
        style={[styles.emptyTitle, { color: colors.text }]}
      >
        No notifications yet
      </Text>
      <Text
        style={[styles.emptyMessage, { color: colors.text + '80' }]}
      >
        {filter === 'unread'
          ? 'You have no unread notifications'
          : 'When you get notifications, they will appear here'}
      </Text>
      {filter === 'unread' && (
        <TouchableOpacity
          style={[styles.showAllButton, { borderColor: colors.primary }]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.showAllText, { color: colors.primary }]}>
            Show all notifications
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render header
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Bell size={24} color={colors.text} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Bildirishnomalar
        </Text>
        {unreadCount > 0 && (
          <View
            style={[
              styles.unreadBadge,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerActionButton, { marginRight: 12 }]}
          onPress={handleMarkAllAsRead}
          disabled={unreadCount === 0 || loading}
        >
          <CheckCircle
            size={22}
            color={unreadCount === 0 ? colors.text + '40' : colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={handleClearAll}
          disabled={notifications.length === 0 || loading}
        >
          <Trash2
            size={22}
            color={
              notifications.length === 0 ? colors.text + '40' : colors.text + '80'
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === 'all' && [
            styles.filterTabActive,
            { backgroundColor: colors.primary },
          ],
        ]}
        onPress={() => setFilter('all')}
      >
        <Text
          style={[
            styles.filterTabText,
            filter === 'all' && [
              styles.filterTabTextActive,
              { color: COLORS.white },
            ],
          ]}
        >
          All ({notifications.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          filter === 'unread' && [
            styles.filterTabActive,
            { backgroundColor: colors.primary },
          ],
        ]}
        onPress={() => setFilter('unread')}
      >
        <View style={styles.filterTabWithBadge}>
          <Text
            style={[
              styles.filterTabText,
              filter === 'unread' && [
                styles.filterTabTextActive,
                { color: COLORS.white },
              ],
            ]}
          >
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        {renderFilterTabs()}
        <NotificationsLoadingSkeleton />
        <BottomNav />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      {renderHeader()}

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  unreadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  filterTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  filterTabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  showAllButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsScreen;