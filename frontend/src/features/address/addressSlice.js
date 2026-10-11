import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeAddress: null,          // No pre-selected static address
  savedAddresses: [],           // Starts empty — user adds their own
  isAddressModalOpen: false,
};

export const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setActiveAddress: (state, action) => {
      state.activeAddress = action.payload;
      state.isAddressModalOpen = false;
    },
    openAddressModal: (state) => {
      state.isAddressModalOpen = true;
    },
    closeAddressModal: (state) => {
      state.isAddressModalOpen = false;
    },
    saveAddress: (state, action) => {
      const newAddr = action.payload;
      // Replace if same id, else push
      const idx = state.savedAddresses.findIndex((a) => a.id === newAddr.id);
      if (idx >= 0) {
        state.savedAddresses[idx] = newAddr;
      } else {
        state.savedAddresses.push(newAddr);
      }
      state.activeAddress = newAddr;
      state.isAddressModalOpen = false;
    },
    deleteAddress: (state, action) => {
      state.savedAddresses = state.savedAddresses.filter(
        (a) => a.id !== action.payload
      );
      if (state.activeAddress?.id === action.payload) {
        state.activeAddress = state.savedAddresses[0] || null;
      }
    },
  },
});

export const { setActiveAddress, openAddressModal, closeAddressModal, saveAddress, deleteAddress } =
  addressSlice.actions;

export const selectActiveAddress    = (state) => state.address.activeAddress;
export const selectSavedAddresses   = (state) => state.address.savedAddresses;
export const selectIsAddressModalOpen = (state) => state.address.isAddressModalOpen;

export default addressSlice.reducer;
