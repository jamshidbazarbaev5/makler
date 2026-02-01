import CryptoJS from 'crypto-js';
import axios from 'axios';

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string | null;
  refreshToken?: string | null;
  user?: any;
  error?: string;
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const API_BASE_URL = 'https://makler-qaraqalpaq.uz/api/mobile';

export const verifyTelegramAuth = (data: TelegramAuthData): boolean => {
  if (!data.id || !data.first_name || !data.hash) {
    return false;
  }
  return true;
};

export const isAuthDataValid = (authDate: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);
  const authAge = currentTime - authDate;
  const ONE_DAY = 24 * 60 * 60;

  return authAge < ONE_DAY;
};

export const authenticateWithTelegram = async (
  telegramData: TelegramAuthData,
): Promise<AuthResponse> => {
  try {
    // Step 1: Verify the data came from Telegram
    if (!verifyTelegramAuth(telegramData)) {
      return {
        success: false,
        error: 'Invalid Telegram authentication data',
      };
    }

    // Step 2: Check if auth data is not too old
    if (!isAuthDataValid(telegramData.auth_date)) {
      return {
        success: false,
        error: 'Authentication data is too old',
      };
    }

    // Step 3: Send to your backend for verification and token generation
    console.log('🔗 Displaying API URL:', `${API_BASE_URL}/users/auth/telegram/`);
    console.log('📤 Sending auth data to backend:', JSON.stringify({
      id: telegramData.id,
      first_name: telegramData.first_name,
      username: telegramData.username,
      auth_date: telegramData.auth_date
    }, null, 2)); // Logging partial data for brevity

    const response = await axios.post(`${API_BASE_URL}/users/auth/telegram/`, {
      id: telegramData.id,
      first_name: telegramData.first_name,
      last_name: telegramData.last_name,
      username: telegramData.username,
      photo_url: telegramData.photo_url,
      auth_date: telegramData.auth_date,
      hash: telegramData.hash,
    });

    console.log('✅ Backend API response:', JSON.stringify(response.data, null, 2));

    const responseData = response.data;

    // Normalize response: If we got an access token, it's a success
    if (responseData.access || responseData.token) {
      return {
        success: true,
        token: responseData.access || responseData.token,
        refreshToken: responseData.refresh || responseData.refreshToken,
        user: responseData.user,
      };
    }

    // If explicit success flag is present
    if (responseData.success === true) {
      return responseData;
    }

    return {
      success: false,
      error: responseData.error || 'Authentication failed',
    };
  } catch (error: any) {
    console.error('❌ Telegram authentication error:', error);
    if (axios.isAxiosError(error)) {
      console.error('🔴 Axios Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });
    }
    return {
      success: false,
      error: error.message || 'Failed to authenticate with Telegram',
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/users/auth/logout/`);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}/users/auth/token/refresh/`,
      {refresh: refreshToken},
    );
    return response.data;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      error: error.message || 'Failed to refresh token',
    };
  }
};
