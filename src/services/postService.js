import { apiClient } from "./apiClient";
import { cachedRequest } from "./requestCache";

/**
 * Blog listing shared by the news sections.
 */
export function getPosts({ page = 1, limit = 10, category, q } = {}) {
  const query = new URLSearchParams({ page, limit, sort: "-publishedAt" });

  if (category) {
    query.set("category", category);
  }

  if (q) {
    query.set("q", q);
  }

  return apiClient.get(`/posts?${query}`);
}

/** One post with its body and a few related posts. */
export function getPost(slug) {
  return apiClient.get(`/posts/${encodeURIComponent(slug)}`);
}

const commentsPath = (slug) => `/posts/${encodeURIComponent(slug)}/comments`;

/** A page of a post's threads, oldest first, each with its replies. */
export function getComments(slug, { page = 1, limit = 20 } = {}) {
  return apiClient.get(`${commentsPath(slug)}?${new URLSearchParams({ page, limit })}`);
}

/** `parentId` makes it a reply; replies always join the first comment's thread. */
export function createComment(slug, { body, parentId = null }) {
  return apiClient.post(commentsPath(slug), { body, parentId });
}

export function updateComment(slug, commentId, { body }) {
  return apiClient.patch(`${commentsPath(slug)}/${encodeURIComponent(commentId)}`, { body });
}

export function deleteComment(slug, commentId) {
  return apiClient.delete(`${commentsPath(slug)}/${encodeURIComponent(commentId)}`);
}

/**
 * Categories used by the tabbed news filter and the blog page.
 */
export function getPostCategories() {
  return cachedRequest("/post-categories", () => apiClient.get("/post-categories"));
}
