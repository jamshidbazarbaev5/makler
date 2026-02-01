import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NotificationsState, Notification } from '../../types';
import MOCK_NOTIFICATIONS from '../../data/mockNotifications';

const initialState: NotificationsState = {
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
  loading: false,
  error: null,
};

// Async thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return mock data instead of API call
      return {
        notifications: MOCK_NOTIFICATIONS,
        unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

// Async thunk to mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return success with notification ID
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return success
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all as read');
    }
  }
);

// Async thunk to delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return success with notification ID
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
        id: `local-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      } as Notification;

      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
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
      state.notifications = action.payload.notifications || action.payload || [];
      state.unreadCount = action.payload.unreadCount ||
        (action.payload.notifications || action.payload).filter((n: Notification) => !n.read).length;
    });

    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch notifications';
    });

    // markAsRead
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload.id);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // markAllAsRead
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    });

    // deleteNotification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    });
  },
});

export const { addLocalNotification, clearAllNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;