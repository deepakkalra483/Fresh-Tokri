import Address from '../models/Address.js';

const fallbackAddresses = [
  {
    id: 'addr-1',
    addressId: 'addr-1',
    label: 'Home',
    flat: 'Flat 402, Green Valley Apartments',
    area: 'Sector 62, Mohali, Punjab',
    tag: 'DEFAULT',
    isDefault: true,
  },
  {
    id: 'addr-2',
    addressId: 'addr-2',
    label: 'Work Office',
    flat: 'Building 14, Quark City Tech Park',
    area: 'Phase 8B, Mohali, Punjab',
    tag: 'WORK',
    isDefault: false,
  },
  {
    id: 'addr-3',
    addressId: 'addr-3',
    label: "Parents' House",
    flat: 'House #1240, Sector 17',
    area: 'Chandigarh',
    tag: 'FAMILY',
    isDefault: false,
  },
];

// @desc    Get all saved addresses
// @route   GET /api/addresses
export const getAddresses = async (req, res, next) => {
  try {
    let addresses;
    try {
      addresses = await Address.find().lean();
      if (!addresses || addresses.length === 0) addresses = fallbackAddresses;
    } catch {
      addresses = fallbackAddresses;
    }

    return res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new delivery address
// @route   POST /api/addresses
export const addAddress = async (req, res, next) => {
  try {
    const { label, flat, area, tag } = req.body;
    const addressId = `addr-${Date.now()}`;

    const newAddress = {
      id: addressId,
      addressId,
      label: label || 'Home',
      flat,
      area,
      tag: tag || 'HOME',
    };

    try {
      await Address.create(newAddress);
    } catch {
      fallbackAddresses.push(newAddress);
    }

    return res.status(201).json({
      success: true,
      data: newAddress,
    });
  } catch (error) {
    next(error);
  }
};

