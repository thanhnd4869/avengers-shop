import { apiClient } from "./apiClient";

const ITEMS_PATH = (variantId) => `/cart/items/${encodeURIComponent(variantId)}`;

export function getCart() {
  return apiClient.get("/cart");
}

export function addCartItem({ variantId, quantity = 1 }) {
  return apiClient.post("/cart/items", { variantId, quantity });
}

export function setCartItemQuantity(variantId, quantity) {
  return apiClient.patch(ITEMS_PATH(variantId), { quantity });
}

export function removeCartItem(variantId) {
  return apiClient.delete(ITEMS_PATH(variantId));
}

export function clearCart() {
  return apiClient.delete("/cart");
}

/** Adds a guest cart into the signed-in account's cart. */
export function mergeCart(items) {
  return apiClient.post("/cart/merge", { items });
}

/** Prices a guest cart without storing it. */
export function previewCart(items) {
  return apiClient.post("/cart/preview", { items });
}
