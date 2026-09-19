import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'instant', // 'instant' | 'morning'
  discountPercentage: 20, // 20% discount for Next Morning farm pre-order
  cutoffTime: '10:00 PM',
  instantEta: '15-20 Mins',
  morningSlot: 'Tomorrow 6:00 AM - 9:00 AM',
};

export const deliveryModeSlice = createSlice({
  name: 'deliveryMode',
  initialState,
  reducers: {
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    toggleMode: (state) => {
      state.mode = state.mode === 'instant' ? 'morning' : 'instant';
    },
  },
});

export const { setMode, toggleMode } = deliveryModeSlice.actions;

export const selectDeliveryMode = (state) => state.deliveryMode.mode;
export const selectDiscountPercentage = (state) => state.deliveryMode.discountPercentage;
export const selectDeliveryInfo = (state) => ({
  mode: state.deliveryMode.mode,
  discountPercentage: state.deliveryMode.discountPercentage,
  cutoffTime: state.deliveryMode.cutoffTime,
  instantEta: state.deliveryMode.instantEta,
  morningSlot: state.deliveryMode.morningSlot,
});

export default deliveryModeSlice.reducer;

