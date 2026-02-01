import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Property} from '../../types';
import api from '../../services/api';

export interface LikesState {
  likedListings: Property[];
  likedIds: string[];
  favoriteMap: { [announcementId: string]: number }; // Maps announcement ID to favorite ID
  loading: boolean;
  error: string | null;
}

const initialState: LikesState = {
  likedListings: [],
  likedIds: [],
  favoriteMap: {},
  loading: false,
  error: null,
};

export const addToFavoritesAsync = createAsyncThunk(
  'likes/addToFavorites',
  async (listing: Property & { id: string }, { rejectWithValue }) => {
    try {
      await api.addToFavorites(listing.id);
      return listing;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add to favorites');
    }
  },
);

export const removeFromFavoritesAsync = createAsyncThunk(
  'likes/removeFromFavorites',
  async ({ announcementId, favoriteId }: { announcementId: string; favoriteId: number }, { rejectWithValue }) => {
    try {
      await api.removeFromFavorites(favoriteId);
      return announcementId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove from favorites');
    }
  },
);

export const loadFavoritesAsync = createAsyncThunk(
  'likes/loadFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getUserFavorites();
      // Extract announcement IDs and create a map of announcement ID to favorite ID
      const announcementIds = response.results.map((fav: any) => fav.announcement);
      const favoriteMap: { [key: string]: number } = {};
      response.results.forEach((fav: any) => {
        favoriteMap[fav.announcement] = fav.id;
      });
      return { announcementIds, favoriteMap };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load favorites');
    }
  },
);

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    addLike: (state, action: PayloadAction<Property>) => {
      if (!state.likedIds.includes(action.payload.id)) {
        state.likedListings.push(action.payload);
        state.likedIds.push(action.payload.id);
      }
    },
    removeLike: (state, action: PayloadAction<string>) => {
      state.likedListings = state.likedListings.filter(
        listing => listing.id !== action.payload,
      );
      state.likedIds = state.likedIds.filter(id => id !== action.payload);
    },
    toggleLike: (state, action: PayloadAction<Property>) => {
      const index = state.likedIds.indexOf(action.payload.id);
      if (index !== -1) {
        // Remove like
        state.likedListings = state.likedListings.filter(
          listing => listing.id !== action.payload.id,
        );
        state.likedIds.splice(index, 1);
      } else {
        // Add like
        state.likedListings.push(action.payload);
        state.likedIds.push(action.payload.id);
      }
    },
    clearLikes: state => {
      state.likedListings = [];
      state.likedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToFavoritesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavoritesAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.likedIds.includes(action.payload.id)) {
          state.likedListings.push(action.payload);
          state.likedIds.push(action.payload.id);
        }
      })
      .addCase(addToFavoritesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeFromFavoritesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavoritesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.likedListings = state.likedListings.filter(
          listing => listing.id !== action.payload,
        );
        state.likedIds = state.likedIds.filter(id => id !== action.payload);
        delete state.favoriteMap[action.payload];
      })
      .addCase(removeFromFavoritesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loadFavoritesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavoritesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.likedIds = action.payload.announcementIds; // Set the IDs from API
        state.favoriteMap = action.payload.favoriteMap; // Store the favorite ID mapping
      })
      .addCase(loadFavoritesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {addLike, removeLike, toggleLike, clearLikes} = likesSlice.actions;
export default likesSlice.reducer;
