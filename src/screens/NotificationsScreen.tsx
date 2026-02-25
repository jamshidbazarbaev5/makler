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
  Modal,
} from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Bell, CheckCircle, Filter, Trash2, ArrowLeft, X, CheckCircle2, FileText } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import BottomNav from '../components/BottomNav';
import NotificationItem from '../components/NotificationItem';
import RejectionReasonSheet from '../components/RejectionReasonSheet';
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
import { useLanguage } from '../localization/LanguageContext';

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t, language } = useLanguage();
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
  const [rejectionSheetVisible, setRejectionSheetVisible] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState<{
    postTitle: string;
    reason: string;
  } | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') {
      return !notification.is_read;
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
      if (!notification.is_read) {
        try {
          await dispatch(markAsRead(notification.id)).unwrap();
        } catch (err) {
          console.error('Failed to mark as read:', err);
        }
      }

      // If it's a rejected post, show the rejection reason sheet
      if (notification.notification_type === 'post_rejected') {
        // Extract post title and reason from message
        const rejectedPattern = /Your post "([^"]+)" was rejected\. Reason: (.+)/;
        const match = notification.message.match(rejectedPattern);

        if (match) {
          const postTitle = match[1];
          const reason = match[2];
          setSelectedRejection({ postTitle, reason });
          setRejectionSheetVisible(true);
        }
      } else {
        // Show notification details in modal
        setSelectedNotification(notification);
        setDetailModalVisible(true);
      }
    },
    [dispatch, navigation]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;

    Alert.alert(
      t.notifications.markAllAsRead,
      t.notifications.markAllConfirm,
      [
        { text: t.notifications.cancel, style: 'cancel' },
        {
          text: t.notifications.markAsRead,
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
      t.notifications.clearAll,
      t.notifications.clearAllConfirm,
      [
        { text: t.notifications.cancel, style: 'cancel' },
        {
          text: t.notifications.deleteAll,
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
      t.notifications.deleteSelected,
      `${selectedNotifications.length} ${t.notifications.deleteSelectedConfirm}`,
      [
        { text: t.notifications.cancel, style: 'cancel' },
        {
          text: t.notifications.delete,
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedNotifications) {
              try {
                await dispatch(deleteNotification(parseInt(id))).unwrap();
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
        {t.notifications.noNotificationsYet}
      </Text>
      <Text
        style={[styles.emptyMessage, { color: colors.text + '80' }]}
      >
        {filter === 'unread'
          ? t.notifications.noUnreadNotifications
          : t.notifications.whenYouGetNotifications}
      </Text>
      {filter === 'unread' && (
        <TouchableOpacity
          style={[styles.showAllButton, { borderColor: colors.primary }]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.showAllText, { color: colors.primary }]}>
            {t.notifications.showAllNotifications}
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
          {t.notifications.title}
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
          {t.notifications.all} ({notifications.length})
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
            {t.notifications.unread}
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
        keyExtractor={(item) => item.id.toString()}
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

      {/* Rejection Reason Bottom Sheet */}
      {selectedRejection && (
        <RejectionReasonSheet
          visible={rejectionSheetVisible}
          onClose={() => {
            setRejectionSheetVisible(false);
            setSelectedRejection(null);
          }}
          postTitle={selectedRejection.postTitle}
          reason={selectedRejection.reason}
        />
      )}

      {/* Notification Detail Bottom Sheet */}
      <Modal
        transparent
        visible={detailModalVisible}
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setDetailModalVisible(false)}
        >
          <View />
        </TouchableOpacity>

        <View style={styles.modalSheet}>
          <View style={styles.modalHandle}>
            <View style={styles.modalHandleBar} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t.notifications.details}</Text>
            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
              <X size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          {selectedNotification && (
            <View style={styles.modalContent}>
              <View style={[
                styles.modalIconBox,
                {
                  backgroundColor: selectedNotification.notification_type === 'post_approved'
                    ? '#dcfce7'
                    : selectedNotification.notification_type === 'payment_success'
                    ? '#dbeafe'
                    : '#fef3c7',
                },
              ]}>
                {selectedNotification.notification_type === 'post_approved' ? (
                  <CheckCircle2 size={28} color="#22c55e" />
                ) : selectedNotification.notification_type === 'payment_success' ? (
                  <CheckCircle2 size={28} color="#3b82f6" />
                ) : (
                  <FileText size={28} color="#f59e0b" />
                )}
              </View>getLocaleCode(language)

              <Text style={styles.modalNotifTitle}>
                {selectedNotification.title}
              </Text>

              <Text style={styles.modalNotifMessage}>
                {selectedNotification.message}
              </Text>

              <Text style={styles.modalNotifDate}>
                {new Date(selectedNotification.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalNotifTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalNotifMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalNotifDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
});

export default NotificationsScreen;