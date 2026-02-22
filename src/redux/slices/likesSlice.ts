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
      const response = await api.addToFavorites(listing.id);
      // response contains the created favorite with its id
      return { listing, favoriteId: response.id as number };
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
      const announcementIds = response.results.map((fav: any) => String(fav.announcement));
      const favoriteMap: { [key: string]: number } = {};
      response.results.forEach((fav: any) => {
        favoriteMap[String(fav.announcement)] = fav.id;
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
      // Optimistic add: immediately show liked state
      .addCase(addToFavoritesAsync.pending, (state, action) => {
        state.error = null;
        const id = String(action.meta.arg.id);
        if (!state.likedIds.includes(id)) {
          state.likedIds.push(id);
        }
      })
      .addCase(addToFavoritesAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { listing, favoriteId } = action.payload;
        const id = String(listing.id);
        if (!state.likedIds.includes(id)) {
          state.likedIds.push(id);
        }
        if (!state.likedListings.find(l => String(l.id) === id)) {
          state.likedListings.push(listing);
        }
        if (favoriteId) {
          state.favoriteMap[id] = favoriteId;
        }
      })
      .addCase(addToFavoritesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Rollback optimistic add
        const id = String(action.meta.arg.id);
        state.likedIds = state.likedIds.filter(i => i !== id);
        state.likedListings = state.likedListings.filter(l => String(l.id) !== id);
      })
      // Optimistic remove: immediately show unliked state
      .addCase(removeFromFavoritesAsync.pending, (state, action) => {
        state.error = null;
        const id = String(action.meta.arg.announcementId);
        state.likedIds = state.likedIds.filter(i => i !== id);
        state.likedListings = state.likedListings.filter(l => String(l.id) !== id);
        delete state.favoriteMap[id];
      })
      .addCase(removeFromFavoritesAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Already removed optimistically, just confirm
        const id = String(action.payload);
        state.likedIds = state.likedIds.filter(i => i !== id);
        delete state.favoriteMap[id];
      })
      .addCase(removeFromFavoritesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Rollback: re-add the item (will be corrected on next loadFavorites)
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
