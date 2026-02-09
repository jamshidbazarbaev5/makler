import axios, {AxiosInstance, AxiosError} from 'axios';
import {Property, PropertyFormData, ApiResponse, PaginatedResponse} from '../types';
import {store} from '../redux/store';
import {refreshToken, clearAuth} from '../redux/slices/authSlice';

const API_BASE_URL = 'https://makler-qaraqalpaq.uz/api/mobile';

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

  async getAnnouncements(page = 1, limit = 20): Promise<{ results: any[]; count: number }> {
    const response = await this.client.get('/announcements/', {
      params: { page, limit },
    });
    return response.data;
  }

  // Get announcements for map view - backend should return only id, title, price, currency, latitude, longitude, property_type
  // For now using regular endpoint with has_coordinates filter if available
  async getAnnouncementsForMap(): Promise<any[]> {
    try {
      // Try to get all announcements with coordinates in one request
      // Backend should ideally have a dedicated lightweight endpoint for this
      const response = await this.client.get('/announcements/', {
        params: {
          limit: 500, // Get more for map
          has_coordinates: true // If backend supports this filter
        },
      });
      return response.data?.results || [];
    } catch (err) {
      console.error('Error fetching map announcements:', err);
      return [];
    }
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
}

export default new ApiClient();
