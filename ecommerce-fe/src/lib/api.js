// src/lib/api.js
// Đọc base từ ENV, fallback về localhost khi dev.
const BASE_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:5171').replace(/\/$/, '');

async function http(path, { method = 'GET', data } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Tránh lỗi khi body rỗng (vd: DELETE 204)
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  listProducts: () => http('/api/products'),
  getProduct: (id) => http(`/api/products/${id}`),
  createProduct: (payload) => http('/api/products', { method: 'POST', data: payload }),
  updateProduct: (id, payload) => http(`/api/products/${id}`, { method: 'PUT', data: payload }),
  deleteProduct: (id) => http(`/api/products/${id}`, { method: 'DELETE' }),
};
