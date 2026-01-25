import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Property} from '../../types';

export interface LikesState {
  likedListings: Property[];
  likedIds: string[];
}

const initialState: LikesState = {
  likedListings: [],
  likedIds: [],
};

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
});

export const {addLike, removeLike, toggleLike, clearLikes} = likesSlice.actions;
export default likesSlice.reducer;
