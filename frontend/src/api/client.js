const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message ?? "Request failed.");
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  listProducts: () => request("/products"),
  createProduct: (product) => request("/products", { method: "POST", body: JSON.stringify(product) }),
  updateProduct: (id, product) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(product) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  getReport: () => request("/reports/inventory")
};
