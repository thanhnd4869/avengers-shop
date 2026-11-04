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
