import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {AuthState, User} from '../../types';
import {authenticateWithTelegram, logoutUser, refreshAccessToken} from '../../services/telegramAuth';

interface TelegramAuthPayload {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

// Async thunk for Telegram authentication
export const loginWithTelegram = createAsyncThunk(
  'auth/loginWithTelegram',
  async (telegramData: TelegramAuthPayload, {rejectWithValue}) => {
    try {
      const response = await authenticateWithTelegram(telegramData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk for token refresh
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (refreshToken: string, {rejectWithValue}) => {
    try {
      const response = await refreshAccessToken(refreshToken);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk for fetching profile
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, {rejectWithValue}) => {
    try {
      const ApiClient = require('../../services/api').default;
      const data = await ApiClient.getProfile();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk for updating profile (JSON fields)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: Partial<any>, {rejectWithValue}) => {
    try {
      const ApiClient = require('../../services/api').default;
      const data = await ApiClient.updateProfile(payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk for uploading avatar (FormData)
export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async (formData: FormData, {rejectWithValue}) => {
    try {
      const ApiClient = require('../../services/api').default;
      const data = await ApiClient.updateAvatar(formData);
      return data;
    } catch (error: any) {
      // Prefer server-provided response body when available
      const payload = error?.response?.data ?? error?.message ?? error;
      return rejectWithValue(payload);
    }
  },
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue}) => {
    try {
      await logoutUser();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('🔐 authSlice.setToken ->', action.payload);
      }
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Login with Telegram
      .addCase(loginWithTelegram.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithTelegram.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token ?? null;
        state.refreshToken = action.payload.refreshToken ?? null;
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('🔐 loginWithTelegram token ->', state.token);
        }
      })
      .addCase(loginWithTelegram.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Refresh Token
      .addCase(refreshToken.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token ?? null;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          console.log('🔐 refreshToken token ->', state.token);
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Clear auth on refresh failure
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Fetch Profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = {...state.user, ...action.payload};
        } else {
          state.user = action.payload;
        }
      })
      // Update Profile (JSON)
      .addCase(updateProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Avatar (multipart)
      .addCase(updateAvatar.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvatar.fulfilled, (state, action) => {
        state.loading = false;
        // Merge any updated profile fields returned by the server
        state.user = {...(state.user ?? {}), ...action.payload};
      })
      .addCase(updateAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.pending, state => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {setUser, setToken, setRefreshToken, clearAuth, setError, clearError} = authSlice.actions;
export default authSlice.reducer;
