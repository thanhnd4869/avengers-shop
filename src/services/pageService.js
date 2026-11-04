import { apiClient } from "./apiClient";
import { cachedRequest } from "./requestCache";

/** A site page such as the FAQ or a policy, by its slug. */
export function getPage(slug) {
  return cachedRequest(`/pages/${slug}`, () => apiClient.get(`/pages/${encodeURIComponent(slug)}`));
}
