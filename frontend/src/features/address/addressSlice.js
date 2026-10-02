import { createSlice } from '@reduxjs/toolkit';

// Static addresses — no backend needed for this (can add Firebase auth later)
const initialAddresses = [
  {
    id: 'addr-1',
    label: 'Home',
    flat: 'Flat 402, Green Valley Apartments',
    area: 'Sector 62, Mohali, Punjab',
    tag: 'DEFAULT',
  },
  {
    id: 'addr-2',
    label: 'Work Office',
    flat: 'Building 14, Quark City Tech Park',
    area: 'Phase 8B, Mohali, Punjab',
    tag: 'WORK',
  },
  {
    id: 'addr-3',
    label: "Parents' House",
    flat: 'House #1240, Sector 17',
    area: 'Chandigarh',
    tag: 'FAMILY',
  },
];

const initialState = {
  activeAddress: initialAddresses[0],
  savedAddresses: initialAddresses,
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
  },
});

export const { setActiveAddress, openAddressModal, closeAddressModal } =
  addressSlice.actions;

export const selectActiveAddress = (state) => state.address.activeAddress;
export const selectSavedAddresses = (state) => state.address.savedAddresses;
export const selectIsAddressModalOpen = (state) => state.address.isAddressModalOpen;

export default addressSlice.reducer;
