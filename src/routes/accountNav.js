import { PATHS } from "./paths";

/**
 * The account area's sections, in menu order. The header's account menu and
 * the account page's sidebar both read this list, so a new section (order
 * history, transactions, the wishlist) is added once, next to its route.
 */
export const ACCOUNT_NAV_ITEMS = Object.freeze([
  { to: PATHS.ACCOUNT_PROFILE, label: "Profile", icon: "user" },
  { to: PATHS.ACCOUNT_ORDERS, label: "Orders", icon: "key" },
  { to: PATHS.ACCOUNT_SECURITY, label: "Security", icon: "lock" },
]);
