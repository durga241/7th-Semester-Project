const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

function authHeaders() {
  let token = '';
  try { token = localStorage.getItem('fc_jwt') || ''; } catch {}
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchProducts(params?: { page?: number; limit?: number; category?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.category) q.set('category', params.category);
  const resp = await fetch(`${API_BASE_URL}/api/products?${q.toString()}`);
  if (!resp.ok) throw new Error('Failed to fetch products');
  return await resp.json();
}

export async function fetchFarmerProducts(farmerId: string) {
  const resp = await fetch(`${API_BASE_URL}/api/products/farmer/${farmerId}`);
  if (!resp.ok) throw new Error('Failed to fetch farmer products');
  return await resp.json();
}

export async function createProduct(payload: any) {
  const form = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'image' && value) {
      form.append('image', value as any);
    } else {
      form.append(key, String(value));
    }
  });
  const headers = authHeaders();
  delete headers['Content-Type'];
  const resp = await fetch(`${API_BASE_URL}/api/products`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (!resp.ok) throw new Error('Create product failed');
  return await resp.json();
}

export async function updateProduct(id: string, payload: any) {
  const form = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'image' && value) {
      form.append('image', value as any);
    } else {
      form.append(key, String(value));
    }
  });
  const headers = authHeaders();
  delete headers['Content-Type'];
  const resp = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers,
    body: form,
  });
  if (!resp.ok) throw new Error('Update product failed');
  return await resp.json();
}

export async function deleteProduct(id: string) {
  const resp = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!resp.ok) throw new Error('Delete product failed');
  return await resp.json();
}

export async function createOrder(items: Array<{ productId: string; quantity: number; price?: number }>) {
  const resp = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  });
  if (!resp.ok) throw new Error('Create order failed');
  return await resp.json();
}

export async function fetchOrders(customerId: string) {
  const resp = await fetch(`${API_BASE_URL}/api/orders/${customerId}`, {
    headers: authHeaders(),
  });
  if (!resp.ok) throw new Error('Fetch orders failed');
  return await resp.json();
}

export async function toggleProductStatus(id: string, status: 'available' | 'out_of_stock') {
  const resp = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!resp.ok) throw new Error('Toggle status failed');
  return await resp.json();
}

export async function toggleProductVisibility(id: string, visibility: 'visible' | 'hidden') {
  const resp = await fetch(`${API_BASE_URL}/api/products/${id}/visibility`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ visibility }),
  });
  if (!resp.ok) throw new Error('Toggle visibility failed');
  return await resp.json();
}

export async function createPaymentOrder(items: Array<{ productId: string; quantity: number; price: number }>, shippingAddress: any) {
  const resp = await fetch(`${API_BASE_URL}/api/orders/create-payment`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ items, shippingAddress }),
  });
  if (!resp.ok) throw new Error('Create payment order failed');
  return await resp.json();
}

export async function verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
  const resp = await fetch(`${API_BASE_URL}/api/orders/verify-payment`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
  });
  if (!resp.ok) throw new Error('Verify payment failed');
  return await resp.json();
}

export async function fetchFarmerOrders(farmerId: string) {
  const resp = await fetch(`${API_BASE_URL}/api/orders/farmer/${farmerId}`, {
    headers: authHeaders(),
  });
  if (!resp.ok) throw new Error('Fetch farmer orders failed');
  return await resp.json();
}

export async function getAllFarmerOrders() {
  const resp = await fetch(`${API_BASE_URL}/api/farmer/orders`, {
    headers: authHeaders(),
  });
  if (!resp.ok) throw new Error('Fetch farmer orders failed');
  return await resp.json();
}

export async function updateOrderStatus(orderId: string, status: string) {
  const resp = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!resp.ok) throw new Error('Update order status failed');
  return await resp.json();
}

export async function toggleProductStock(id: string, inStock: boolean) {
  const status = inStock ? 'available' : 'out_of_stock';
  return toggleProductStatus(id, status);
}
