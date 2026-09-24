const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// --- PRODUCTS API ---
export const fetchProductsAPI = async () => {
  try {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[Admin API Warning]: Produce API offline. Resilient fallback.', err.message);
    return null;
  }
};

export const createProductAPI = async (productData) => {
  try {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('[Admin API Warning]: Creating product locally.', err.message);
    return null;
  }
};

export const updateProductAPI = async (id, productData) => {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

export const deleteProductAPI = async (id) => {
  try {
    await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
  } catch (err) {
    // Resilient fallback
  }
};

// --- ORDERS API ---
export const fetchAllOrdersAPI = async () => {
  try {
    const res = await fetch(`${BASE_URL}/orders/all`);
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

export const updateOrderStatusAPI = async (id, status) => {
  try {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

export const assignRiderAPI = async (id, rider) => {
  try {
    const res = await fetch(`${BASE_URL}/orders/${id}/assign-rider`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rider }),
    });
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

// --- CUSTOMERS & DASHBOARD API ---
export const fetchCustomersAPI = async () => {
  try {
    const res = await fetch(`${BASE_URL}/customers`);
    if (!res.ok) throw new Error('API Error');
    const json = await res.json();
    return json.data;
  } catch (err) {
    return null;
  }
};

