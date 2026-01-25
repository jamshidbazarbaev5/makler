import axios, {AxiosInstance, AxiosError} from 'axios';
import {Property, PropertyFormData, ApiResponse, PaginatedResponse} from '../types';
import {store} from '../redux/store';
import {refreshToken, clearAuth} from '../redux/slices/authSlice';

const API_BASE_URL = 'https://stock-control.uz/api/mobile';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: any[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      // Do not set a default Content-Type so multipart/form-data requests are not overwritten
      headers: {},
    });

    // Add interceptor for auth token
    this.client.interceptors.request.use(config => {
      // Get token from Redux store
      const state = store.getState();
      const token = state.auth.token;

      // Dev-only logging for token visibility while debugging
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.log('🔐 ApiClient: auth token for', config.url, ':', token);
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    });

    // Add response interceptor to handle token expiration
    this.client.interceptors.response.use(
      response => response,
      error => {
        const originalRequest = error.config;

        // Check if error is 401 (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            // Wait for token refresh to complete
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
            // No refresh token, logout user
            store.dispatch(clearAuth() as any);
            return Promise.reject(error);
          }

          // Try to refresh token
          return store.dispatch(refreshToken(refreshTokenValue) as any)
            .then((action: any) => {
              if (action.payload?.success) {
                // Token refreshed, process queued requests
                this.failedQueue.forEach(callback => callback());
                this.failedQueue = [];

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${store.getState().auth.token}`;
                return this.client(originalRequest);
              } else {
                // Token refresh failed, logout user
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

  // Property endpoints
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

  async createProperty(data: PropertyFormData): Promise<Property> {
    const response = await this.client.post<ApiResponse<Property>>('/properties', data);
    return response.data.data;
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
      // Use PATCH for partial updates (server expects PATCH for profile edits)
      const response = await this.client.patch('/users/profile/me/', data);
      console.log('👤 Update Profile Response:', JSON.stringify(response.data, null, 2));
      return response.data?.data ?? response.data;
    } catch (err: any) {
      console.error('👤 updateProfile error:', err?.response?.data ?? err?.message ?? err);
      // Fallback to PUT for backward compatibility if server rejects PATCH with 405
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
      // Prefer fetch for uploading FormData in React Native to ensure multipart is sent correctly
      const state = store.getState();
      const token = state.auth.token;
      const url = `${API_BASE_URL}/users/profile/me/`;

      // Try PATCH first
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

        // If PATCH is not allowed (405), try PUT as a fallback
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
}

export default new ApiClient();
