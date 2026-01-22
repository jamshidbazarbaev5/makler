// User Profile Types
export interface UserProfile {
  id: string;
  username: string;
  listingCount: number;
  avatarUrl: string;
}

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters
  image: string;
  images?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images?: string[];
}

export interface FilterState {
  category: string;
  propertyType: string;
  country: string;
  region: string;
  apartmentType: string;
  roomCountStart: number;
  roomCountEnd: number;
  renovation: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  postedBy: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Redux State Types
export interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}
