import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationsState, Notification } from '../../types';
import apiClient from '../../services/api';

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  loading: false,
  error: null,
};

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📢 Fetching notifications from API...');
      const response = await apiClient.getNotifications();
      console.log('📢 Notifications response:', JSON.stringify(response, null, 2));

      const countResponse = await apiClient.getNotificationsCount();
      console.log('📢 Count response:', JSON.stringify(countResponse, null, 2));

      return {
        notifications: response.results,
        unreadCount: countResponse.unread_count,
        totalCount: countResponse.total_count,
      };
    } catch (error: any) {
      console.error('📢 Failed to fetch notifications:', error);
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

// Async thunk to mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      return { id: notificationId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark as read');
    }
  }
);

// Async thunk to mark all as read
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.markAllNotificationsAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all as read');
    }
  }
);

// Async thunk to delete notification (keeping for UI purposes, but no API endpoint for delete)
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      // No delete endpoint in API, so just mark as read and remove from local state
      await apiClient.markNotificationAsRead(notificationId);
      return { id: notificationId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add local notification without API call
    addLocalNotification: (state, action) => {
      const notification = {
        ...action.payload,
        id: Date.now(),
        created_at: new Date().toISOString(),
        is_read: false,
      } as Notification;

      state.notifications.unshift(notification);
      state.unreadCount += 1;
      state.totalCount += 1;
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    // fetchNotifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.totalCount = action.payload.totalCount;
    });

    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch notifications';
    });

    // markAsRead
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload.id);
      if (notification && !notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // markAllAsRead
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      const now = new Date().toISOString();
      state.notifications.forEach(notification => {
        notification.is_read = true;
        notification.read_at = now;
      });
      state.unreadCount = 0;
    });

    // deleteNotification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
        state.totalCount = Math.max(0, state.totalCount - 1);
      }
    });
  },
});

export const { addLocalNotification, clearAllNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;