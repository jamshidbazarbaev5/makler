import axios, {AxiosInstance, AxiosError} from 'axios';
import {Property, PropertyFormData, ApiResponse, PaginatedResponse} from '../types';
import {store} from '../redux/store';
import {refreshToken, clearAuth} from '../redux/slices/authSlice';

const API_BASE_URL = 'https://makler-qaraqalpaq.uz/api/mobile';

export interface AppSettings {
  id: number;
  payment_enabled: boolean;
  featured_enabled: boolean;
  post_price: string;
  featured_price: string;
  post_duration_days: number;
  featured_duration_days: number;
  require_moderation: boolean;
  auto_deactivate_expired: boolean;
  notify_expiring_days: number;
  max_images_per_post: number;
  max_draft_announcements: number;
  admin_phone: string;
  created_at: string;
  updated_at: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {},
    });

    //  interceptor for auth token
    this.client.interceptors.request.use(config => {
      // Get token from Redux store
      const state = store.getState();
      const token = state.auth.token;

      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('🔐 ApiClient: auth token for', config.url, ':', token);
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    });

    //  response interceptor to handle token expiration
    this.client.interceptors.response.use(
      response => response,
      error => {
        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise(resolve => {
              this.failedQueue.push(() => {
                originalRequest.headers.Authorization = `Bearer ${store.getState().auth.token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          this.isRefreshing = true;
          const state = store.getState();
          const refreshTokenValue = state.auth.refreshToken;

          if (!refreshTokenValue) {
            store.dispatch(clearAuth() as any);
            return Promise.reject(error);
          }

          return store.dispatch(refreshToken(refreshTokenValue) as any)
            .then((action: any) => {
              if (action.payload?.success) {
                this.failedQueue.forEach(callback => callback());
                this.failedQueue = [];

                originalRequest.headers.Authorization = `Bearer ${store.getState().auth.token}`;
                return this.client(originalRequest);
              } else {
                store.dispatch(clearAuth() as any);
                return Promise.reject(error);
              }
            })
            .catch(() => {
              store.dispatch(clearAuth() as any);
              return Promise.reject(error);
            })
            .finally(() => {
              this.isRefreshing = false;
            });
        }

        return Promise.reject(error);
      },
    );
  }

  async getProperties(page = 1, limit = 10): Promise<PaginatedResponse<Property>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<Property>>>(
      '/properties',
      {params: {page, limit}},
    );
    return response.data.data;
  }

  async getPropertyById(id: string): Promise<Property> {
    const response = await this.client.get<ApiResponse<Property>>(`/properties/${id}`);
    return response.data.data;
  }

  async createProperty(data: any): Promise<any> {
    console.log('🚀 Creating Announcement with Payload:', JSON.stringify(data, null, 2));
    const response = await this.client.post('/announcements/', data);
    return response.data;
  }

  async updateAnnouncement(id: string, data: any): Promise<any> {
    console.log('📝 Updating Announcement', id, 'with:', JSON.stringify(data, null, 2));
    const response = await this.client.patch(`/announcements/${id}/`, data);
    return response.data;
  }

  async deleteAnnouncementImage(announcementId: string, imageId: number): Promise<void> {
    await this.client.delete(`/announcements/${announcementId}/images/${imageId}/`);
  }

  async updateProperty(id: string, data: Partial<PropertyFormData>): Promise<Property> {
    const response = await this.client.put<ApiResponse<Property>>(
      `/properties/${id}`,
      data,
    );
    return response.data.data;
  }

  async deleteProperty(id: string): Promise<void> {
    await this.client.delete(`/properties/${id}`);
  }

  async searchProperties(query: string): Promise<Property[]> {
    const response = await this.client.get<ApiResponse<Property[]>>('/properties/search', {
      params: {q: query},
    });
    return response.data.data;
  }

  async getProfile(): Promise<any> {
    const response = await this.client.get('/users/profile/me/');
    console.log('👤 Profile Data:', JSON.stringify(response.data, null, 2));
    // If API wraps payload as { success, data: {...} } return inner data for consistency
    return response.data?.data ?? response.data;
  }

  async updateProfile(data: Partial<any>): Promise<any> {
    try {
      const response = await this.client.patch('/users/profile/me/', data);
      console.log('👤 Update Profile Response:', JSON.stringify(response.data, null, 2));
      return response.data?.data ?? response.data;
    } catch (err: any) {
      console.error('👤 updateProfile error:', err?.response?.data ?? err?.message ?? err);
      if (err?.response?.status === 405) {
        const response = await this.client.put('/users/profile/me/', data);
        console.log('👤 Update Profile Response (PUT fallback):', JSON.stringify(response.data, null, 2));
        return response.data?.data ?? response.data;
      }
      throw err;
    }
  }

  async updateAvatar(formData: FormData): Promise<any> {
    try {
      const state = store.getState();
      const token = state.auth.token;
      const url = `${API_BASE_URL}/users/profile/me/`;

      const headers: any = { Accept: 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      let response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: formData,
      });

      let json = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('👤 updateAvatar fetch error:', json);

        if (response.status === 405) {
          const headers2: any = { Accept: 'application/json' };
          if (token) headers2.Authorization = `Bearer ${token}`;

          response = await fetch(url, {
            method: 'PUT',
            headers: headers2,
            body: formData,
          });

          const json2 = await response.json().catch(() => ({}));
          if (!response.ok) {
            console.error('👤 updateAvatar PUT fallback error:', json2);
            const err: any = new Error(JSON.stringify(json2));
            err.response = { data: json2, status: response.status };
            throw err;
          }

          console.log('👤 Update Avatar Response (fetch PUT):', JSON.stringify(json2, null, 2));
          return json2?.data ?? json2;
        }

        const err: any = new Error(JSON.stringify(json));
        err.response = { data: json, status: response.status };
        throw err;
      }

      console.log('👤 Update Avatar Response (fetch):', JSON.stringify(json, null, 2));
      return json?.data ?? json;
    } catch (err: any) {
      console.error('👤 updateAvatar fetch error:', err?.response?.data ?? err?.message ?? err);
      throw err;
    }
  }

  async deleteAccount(): Promise<void> {
    await this.client.delete('/users/profile/me/delete/');
  }

  async getAnnouncements(page = 1, limit = 20, filters: Record<string, string> = {}): Promise<{ results: any[]; count: number; next: string | null }> {
    // Strip empty values before sending
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
    );
    console.log('📡 getAnnouncements params:', { page, limit, ...cleanFilters });
    const response = await this.client.get('/announcements/', {
      params: { page, limit, ...cleanFilters },
    });
    return response.data;
  }

  async getFeaturedAnnouncements(): Promise<{ results: any[]; count: number }> {
    const response = await this.client.get('/announcements/featured/');
    return response.data;
  }

  async getAnnouncementsForMap(bounds?: {
    lat_min: number;
    lat_max: number;
    lng_min: number;
    lng_max: number;
  }): Promise<{ results: any[]; count: number }> {
    const params: any = {
      limit: 500,
      ...(bounds && {
        lat_min: bounds.lat_min,
        lat_max: bounds.lat_max,
        lng_min: bounds.lng_min,
        lng_max: bounds.lng_max,
      }),
    };
    const response = await this.client.get('/announcements/', { params });
    return response.data;
  }

  async uploadAnnouncementImage(id: string, imageUri: string): Promise<any> {
    const formData = new FormData();
    // The server error {"images":["Обязательное поле."]} suggests the field name should be 'images'
    // or specifically matching what the serializer expects.
    // Let's try 'images' based on the error key.
    formData.append('images', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    console.log(`📤 Uploading image for announcement ${id}`);

    // We use fetch here because axios sometimes has issues with FormData in React Native
    const state = store.getState();
    const token = state.auth.token;

    // We need to use the base URL from the client instance or the constant
    const url = `${API_BASE_URL}/announcements/${id}/upload_image/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image upload failed:', errorText);
      throw new Error(`Image upload failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  async getAnnouncementById(id: string): Promise<any> {
    const response = await this.client.get(`/announcements/${id}/`);
    return response.data;
  }

  async getRelatedAnnouncements(id: string): Promise<any[]> {
    const response = await this.client.get(`/announcements/${id}/related/`);
    return response.data?.results || response.data || [];
  }

  async getDistricts(): Promise<any[]> {
    const response = await this.client.get('/districts/');
    return response.data?.results ?? response.data;
  }

  async addToFavorites(announcementId: string): Promise<any> {
    const response = await this.client.post('/users/favorites/', {
      announcement: announcementId,
    });
    return response.data;
  }

  async removeFromFavorites(favoriteId: number): Promise<any> {
    const response = await this.client.delete(`/users/favorites/${favoriteId}/`);
    return response.data;
  }

  async getUserFavorites(): Promise<any> {
    const response = await this.client.get('/users/favorites/');
    return response.data;
  }

  async getMyAnnouncements(status?: string, page = 1, limit = 20): Promise<any> {
    const endpoint = status ? `/announcements/my/${status}/` : '/announcements/my/';
    const response = await this.client.get(endpoint, {
      params: { page, limit },
    });
    return response.data;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await this.client.delete(`/announcements/${id}/`);
  }

  async getMyAnnouncementsCounts(): Promise<{
    counts: Record<string, number>;
    tab_counts: Record<string, number>;
  }> {
    const response = await this.client.get('/announcements/my_by_status/');
    return response.data;
  }

  async deactivateAnnouncement(id: string): Promise<any> {
    const response = await this.client.post(`/announcements/${id}/deactivate/`, {});
    return response.data;
  }

  async markAnnouncementSold(id: string): Promise<any> {
    const response = await this.client.post(`/announcements/${id}/mark_sold/`, {});
    return response.data;
  }

  async markAnnouncementRented(id: string): Promise<any> {
    const response = await this.client.post(`/announcements/${id}/mark_rented/`, {});
    return response.data;
  }

  // Notifications API
  async getNotifications(): Promise<{ count: number; next: string | null; previous: string | null; results: any[] }> {
    const response = await this.client.get('/notifications/');
    return response.data;
  }

  async getNotificationsCount(): Promise<{ unread_count: number; total_count: number }> {
    const response = await this.client.get('/notifications/count/');
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<any> {
    const response = await this.client.post(`/notifications/${notificationId}/read/`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<any> {
    const response = await this.client.post('/notifications/read_all/');
    return response.data;
  }

  // Payment API methods

  /**
   * Create a payment for posting an announcement
   * POST /payments/post/
   */
  async createPostPayment(announcementId: string): Promise<any> {
    const response = await this.client.post('/payments/post/', {
      announcement_id: announcementId,
    });
    return response.data;
  }

  /**
   * Create a payment for featuring an announcement (top posts)
   * POST /payments/featured/
   */
  async createFeaturedPayment(announcementId: string): Promise<any> {
    const response = await this.client.post('/payments/featured/', {
      announcement_id: announcementId,
    });
    return response.data;
  }

  /**
   * Generic create payment method
   */
  async createPayment(endpoint: string, data: { announcement_id: string }): Promise<any> {
    const response = await this.client.post(endpoint, data);
    return response.data;
  }

  /**
   * Submit card details for payment
   * POST /payments/{payment_id}/card/create/
   */
  async submitCard(paymentId: string, data: { card_number: string; card_expire: string }): Promise<any> {
    const response = await this.client.post(`/payments/${paymentId}/card/create/`, data);
    return response.data;
  }

  /**
   * Verify card with SMS code
   * POST /payments/{payment_id}/card/verify/
   */
  async verifyCard(paymentId: string, data: { code: string }): Promise<any> {
    const response = await this.client.post(`/payments/${paymentId}/card/verify/`, data);
    return response.data;
  }

  /**
   * Resend verification code
   * POST /payments/{payment_id}/card/resend/
   */
  async resendCode(paymentId: string): Promise<any> {
    const response = await this.client.post(`/payments/${paymentId}/card/resend/`);
    return response.data;
  }

  /**
   * Process the payment after card verification
   * POST /payments/{payment_id}/pay/
   */
  async processPayment(paymentId: string): Promise<any> {
    const response = await this.client.post(`/payments/${paymentId}/pay/`);
    return response.data;
  }

  /**
   * Get payment status
   * GET /payments/{payment_id}/status/
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    const response = await this.client.get(`/payments/${paymentId}/status/`);
    return response.data;
  }

  async getPaymentHistory(): Promise<{ results: any[]; count: number; next: string | null }> {
    const response = await this.client.get('/payments/');
    return response.data;
  }

  /**
   * Get payment settings (prices, durations, etc.)
   * GET /payments/settings/
   */
  async getPaymentSettings(): Promise<{
    payment_enabled: boolean;
    featured_enabled: boolean;
    post_price: string;
    featured_price: string;
    post_duration_days: number;
    featured_duration_days: number;
  }> {
    const response = await this.client.get('/payments/settings/');
    return response.data;
  }

  /**
   * Get app settings (admin phone, etc.)
   * GET /api/admin/settings/app/
   */
  async getAppSettings(): Promise<AppSettings> {
    const response = await axios.get('https://makler-qaraqalpaq.uz/api/admin/settings/app/');
    return response.data;
  }
}

export default new ApiClient();
