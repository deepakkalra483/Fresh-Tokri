const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const fetchProductsAPI = async (category = 'all', search = '') => {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('search', search);

    const response = await fetch(`${BASE_URL}/products?${params.toString()}`);
    if (!response.ok) throw new Error('API Response Error');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn('[API Client Warning]: Backend not reachable. Using resilient client data.', error.message);
    return null;
  }
};

export const createOrderAPI = async (orderPayload) => {
  try {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!response.ok) throw new Error('API Order Error');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.warn('[API Order Client Warning]: Using resilient local order state.', error.message);
    return null;
  }
};

export const fetchActiveOrderAPI = async () => {
  try {
    const response = await fetch(`${BASE_URL}/orders/active`);
    if (!response.ok) throw new Error('API Response Error');
    const json = await response.json();
    return json.data;
  } catch {
    return null;
  }
};

export const fetchAddressesAPI = async () => {
  try {
    const response = await fetch(`${BASE_URL}/addresses`);
    if (!response.ok) throw new Error('API Response Error');
    const json = await response.json();
    return json.data;
  } catch {
    return null;
  }
};

export const fetchAllOrdersAPI = async () => {
  try {
    const response = await fetch(`${BASE_URL}/orders/all`);
    if (!response.ok) throw new Error('API Response Error');
    const json = await response.json();
    return json.data;
  } catch {
    return null;
  }
};
