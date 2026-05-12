import { store } from "../data/database.js";

export function listProducts() {
  return store.listProducts();
}

export function getProduct(id) {
  return store.getProduct(id);
}

export function createProduct(payload) {
  return store.createProduct(payload);
}

export function updateProduct(id, payload) {
  return store.updateProduct(id, payload);
}

export function deleteProduct(id) {
  return store.deleteProduct(id);
}
