import axios, {AxiosInstance} from 'axios';
import {Property, PropertyFormData, ApiResponse, PaginatedResponse} from '../types';

const API_BASE_URL = 'https://api.example.com'; // Replace with your API

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add interceptor for auth token
    this.client.interceptors.request.use(config => {
      // TODO: Add auth token to headers when available
      return config;
    });
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
}

export default new ApiClient();
