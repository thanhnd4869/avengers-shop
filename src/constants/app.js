/**
 * Application-wide constants.
 *
 * Only variables prefixed with `WEBPACK_` are exposed to the browser bundle, so
 * they are read here once and shared from a single place. Never put secrets in
 * these values.
 */
/*
 * Webpack replaces `process.env.WEBPACK_*` at build time, but only for names
 * present in `.env`. Reading through a guarded helper keeps the bundle working
 * when a variable is missing, instead of throwing "process is not defined".
 */
const readEnv = (value, fallback) => (typeof value === "string" && value ? value : fallback);

export const APP_NAME = readEnv(process.env.WEBPACK_APP_NAME, "Avengers Store");

export const API_URL = readEnv(process.env.WEBPACK_API_URL, "http://localhost:8000/api/v1");

/** Public origin of the shop, for canonical links and social previews. */
export const SITE_URL = readEnv(process.env.WEBPACK_SITE_URL, window.location.origin).replace(
  /\/$/,
  "",
);

/** The admin dashboard (avengers-admin); its menu link is hidden when unset. */
export const ADMIN_URL = readEnv(process.env.WEBPACK_ADMIN_URL, "");

export const SITE_DESCRIPTION =
  "Genuine game keys for PC and consoles, delivered instantly after payment.";
