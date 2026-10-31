import { apiClient } from "./apiClient";

const orderPath = (number) => `/orders/${encodeURIComponent(number)}`;

/**
 * Checks out the cart. `idempotencyKey` must stay the same for retries of one
 * checkout, so a double click or a retry after a timeout gets the same order;
 * `expectedTotal` is the total the shopper saw, which the API checks.
 */
export function createOrder({ idempotencyKey, expectedTotal }) {
  return apiClient.post("/orders", { idempotencyKey, expectedTotal });
}

export function getOrders({ page = 1, limit = 10 } = {}) {
  return apiClient.get(`/orders?${new URLSearchParams({ page, limit })}`);
}

export function getPendingOrder() {
  return apiClient.get("/orders/pending");
}

export function getOrder(number) {
  return apiClient.get(orderPath(number));
}

export function cancelOrder(number) {
  return apiClient.post(`${orderPath(number)}/cancel`);
}
