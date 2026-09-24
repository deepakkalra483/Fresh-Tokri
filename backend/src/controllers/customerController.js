const mockCustomers = [
  { id: 'c1', name: 'Deepak Kumar', phone: '+91 98765 43210', email: 'deepak@example.com', totalOrders: 14, totalSpent: 2840, address: 'Sector 62, Mohali', joined: 'Jan 2026' },
  { id: 'c2', name: 'Priya Sharma', phone: '+91 98123 45678', email: 'priya@example.com', totalOrders: 8, totalSpent: 1920, address: 'Sector 17, Chandigarh', joined: 'Feb 2026' },
  { id: 'c3', name: 'Amit Verma', phone: '+91 99887 76655', email: 'amit@example.com', totalOrders: 5, totalSpent: 850, address: 'Phase 8B, Mohali', joined: 'Mar 2026' }
];

// @desc    Get customer directory
// @route   GET /api/customers
export const getCustomers = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      count: mockCustomers.length,
      data: mockCustomers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Store Dashboard Analytics KPIs
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue: 5610,
        pendingOrders: 3,
        instantOrdersCount: 18,
        morningOrdersCount: 14,
        totalCustomers: mockCustomers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

