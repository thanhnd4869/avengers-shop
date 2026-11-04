import { apiClient } from "./apiClient";
import { cachedRequest } from "./requestCache";

/** Picture albums for the gallery page, each with its cover and images. */
export function getGalleries({ limit = 6 } = {}) {
  const path = `/galleries?limit=${limit}`;

  return cachedRequest(path, () => apiClient.get(path));
}
