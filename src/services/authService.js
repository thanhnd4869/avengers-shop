import { apiClient, refreshSession } from "./apiClient";
import { setAccessToken } from "./session";

// Sign-in, sign-up and refresh answer `{ data: { user, accessToken } }`; the
// token is kept by the client and only the user is handed to the caller.
function startSession(response) {
  setAccessToken(response.data.accessToken);

  return response.data.user;
}

/**
 * Account sign-in. Starting a session here ends the one on any other device.
 */
export async function login({ email, password, remember }) {
  return startSession(await apiClient.post("/auth/login", { email, password, remember }));
}

/**
 * Account creation. The visitor is signed in straight away and asked to
 * verify their email address afterwards.
 */
export async function register({ displayName, email, password }) {
  return startSession(await apiClient.post("/auth/register", { displayName, email, password }));
}

/**
 * Restores the session from the refresh cookie after a reload.
 */
export async function restoreSession() {
  return (await refreshSession()).user;
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

export async function getCurrentUser() {
  return (await apiClient.get("/auth/me")).data;
}

export async function verifyEmail(token) {
  return (await apiClient.post("/auth/verify-email", { token })).data;
}

export function resendVerificationEmail() {
  return apiClient.post("/auth/verify-email/resend");
}

export function requestPasswordReset(email) {
  return apiClient.post("/auth/forgot-password", { email });
}

export function resetPassword({ token, password }) {
  return apiClient.post("/auth/reset-password", { token, password });
}

export async function updateProfile({ displayName }) {
  return (await apiClient.patch("/auth/me", { displayName })).data;
}

/**
 * The server ends every other session and answers with a new one for this
 * device, so the new token replaces the old one here.
 */
export async function changePassword({ currentPassword, newPassword }) {
  return startSession(
    await apiClient.post("/auth/change-password", { currentPassword, newPassword }),
  );
}

export async function requestEmailChange({ email, password }) {
  return (await apiClient.post("/auth/change-email", { email, password })).data;
}

export async function cancelEmailChange() {
  return (await apiClient.delete("/auth/change-email")).data;
}

export async function confirmEmailChange(token) {
  return (await apiClient.post("/auth/change-email/confirm", { token })).data;
}

export async function deleteAccount({ password }) {
  await apiClient.delete("/auth/me", { data: { password } });
  setAccessToken(null);
}
