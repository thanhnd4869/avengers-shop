import { apiClient } from "./apiClient";
import { cachedRequest } from "./requestCache";

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

/** Payment methods the API can take right now, e.g. `["vnpay"]`. */
export function getPaymentMethods() {
  return cachedRequest("/payments/methods", () => apiClient.get("/payments/methods"));
}

/** Starts a VNPay payment; answers the URL to send the shopper to. */
export function startVnpayPayment(number) {
  return apiClient.post(`${orderPath(number)}/payments/vnpay`);
}

/**
 * Reports VNPay's redirect back to the API, which checks its signature and
 * asks VNPay for the result before answering the payment's status.
 */
export function confirmVnpayReturn(number, params) {
  return apiClient.post(`${orderPath(number)}/payments/vnpay/return`, { params });
}
