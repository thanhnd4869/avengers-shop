/**
 * Sign-in providers this client knows, keyed by the API's name, in the order
 * their buttons appear. Logos live in `components/ProviderLogo`.
 */
export const OAUTH_PROVIDERS = Object.freeze({
  google: { label: "Google" },
  facebook: { label: "Facebook" },
});

/**
 * What the visitor reads when a sign-in with Google or Facebook does not go
 * through. The API only ever sends one of these codes back, never the
 * provider's own wording.
 */
export const OAUTH_ERROR_MESSAGES = Object.freeze({
  cancelled: "Sign-in was cancelled.",
  expired: "That sign-in took too long or was started in another browser. Please try again.",
  provider: "We could not get your details from the provider. Please try again.",
  unavailable: "This sign-in method is not available right now.",
  account_exists:
    "An account already uses this email address. Sign in with your password, then connect this account from Account › Security.",
  identity_in_use: "That account is already connected to another user.",
  already_linked: "You already have an account of this kind connected.",
  reauth_mismatch: "That is not the account connected to your profile. Please try again.",
  try_again: "Something went wrong on our side. Please try again in a moment.",
});

export function oauthErrorMessage(code) {
  return OAUTH_ERROR_MESSAGES[code] ?? OAUTH_ERROR_MESSAGES.try_again;
}

export function providerLabel(provider) {
  return OAUTH_PROVIDERS[provider]?.label ?? provider;
}
