import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {Property, PropertyFormData, PropertyState} from '../../types';
import api from '../../services/api';

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
  page: 1,
  total: 0,
};

// Async thunks
export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async ({page = 1, limit = 10}: {page?: number; limit?: number}) => {
    const response = await api.getProperties(page, limit);
    return response;
  },
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchPropertyById',
  async (id: string) => {
    return await api.getPropertyById(id);
  },
);

export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (data: PropertyFormData) => {
    return await api.createProperty(data);
  },
);

export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async ({id, data}: {id: string; data: Partial<PropertyFormData>}) => {
    return await api.updateProperty(id, data);
  },
);

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (id: string) => {
    await api.deleteProperty(id);
    return id;
  },
);

export const searchProperties = createAsyncThunk(
  'properties/searchProperties',
  async (query: string) => {
    return await api.searchProperties(query);
  },
);

const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearCurrentProperty: state => {
      state.currentProperty = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch Properties
    builder.addCase(fetchProperties.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProperties.fulfilled, (state, action) => {
      state.loading = false;
      state.properties = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
    });
    builder.addCase(fetchProperties.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch properties';
    });

    // Fetch Single Property
    builder.addCase(fetchPropertyById.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPropertyById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProperty = action.payload;
    });
    builder.addCase(fetchPropertyById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch property';
    });

    // Create Property
    builder.addCase(createProperty.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.properties.unshift(action.payload);
    });
    builder.addCase(createProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create property';
    });

    // Update Property
    builder.addCase(updateProperty.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProperty.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.properties.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.properties[index] = action.payload;
      }
      state.currentProperty = action.payload;
    });
    builder.addCase(updateProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update property';
    });

    // Delete Property
    builder.addCase(deleteProperty.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteProperty.fulfilled, (state, action) => {
      state.loading = false;
      state.properties = state.properties.filter(p => p.id !== action.payload);
    });
    builder.addCase(deleteProperty.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete property';
    });

    // Search Properties
    builder.addCase(searchProperties.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchProperties.fulfilled, (state, action) => {
      state.loading = false;
      state.properties = action.payload;
    });
    builder.addCase(searchProperties.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to search properties';
    });
  },
});

export const {clearCurrentProperty, clearError} = propertySlice.actions;
export default propertySlice.reducer;
