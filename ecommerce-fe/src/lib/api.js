// Dùng HTTP đúng port 5171
const BASE_URL = 'http://localhost:5171';

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

  // Tránh lỗi khi body rỗng (vd: DELETE 200 không nội dung)
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
