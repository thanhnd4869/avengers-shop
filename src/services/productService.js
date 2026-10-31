import { apiClient } from "./apiClient";
import { cachedRequest } from "./requestCache";

/**
 * Product listing shared by the storefront sections and the shop page.
 *
 * Curated lists (deals, new releases, pre-orders) are requested by
 * `collection`, and the API orders each one the way it suits: biggest
 * discount, newest, or soonest release. `sort` is only sent to override that
 * order. Empty filters are left out of the query.
 */
export function getProducts({
  page = 1,
  limit = 10,
  sort,
  collection,
  platform,
  category,
  q,
  minPrice,
  maxPrice,
} = {}) {
  const query = new URLSearchParams({ page, limit });
  const filters = { sort, collection, platform, category, q, minPrice, maxPrice };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  }

  return apiClient.get(`/products?${query}`);
}

export function getProduct(slug) {
  return apiClient.get(`/products/${encodeURIComponent(slug)}`);
}

export function getRelatedProducts(slug, { limit = 4 } = {}) {
  return apiClient.get(`/products/${encodeURIComponent(slug)}/related?limit=${limit}`);
}

export function getProductReviews(slug, { page = 1, limit = 10 } = {}) {
  const query = new URLSearchParams({ page, limit });

  return apiClient.get(`/products/${encodeURIComponent(slug)}/reviews?${query}`);
}

/**
 * Genres such as Action Games or FPS, used by the shop filter and the
 * product page sidebar.
 */
export function getProductCategories() {
  return cachedRequest("/product-categories", () => apiClient.get("/product-categories"));
}
