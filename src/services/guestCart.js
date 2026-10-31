/**
 * A visitor's cart before they sign in, kept in `localStorage` as variant ids
 * and quantities only. Prices and names always come from the API.
 *
 * Other tabs are told through the `storage` event, so a cart changed in one
 * tab shows up in the others.
 */
const STORAGE_KEY = "avengers:guest-cart";
export const MAX_QUANTITY = 10;
export const MAX_LINES = 50;

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function isValidItem(item) {
  return (
    item &&
    typeof item.variantId === "string" &&
    OBJECT_ID.test(item.variantId) &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1
  );
}

export function readGuestCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

    // Anything edited by hand or left by an older version is cleaned up
    // rather than sent to the API.
    return Array.isArray(parsed)
      ? parsed
          .filter(isValidItem)
          .slice(0, MAX_LINES)
          .map(({ variantId, quantity }) => ({
            variantId,
            quantity: Math.min(quantity, MAX_QUANTITY),
          }))
      : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items) {
  try {
    if (items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Private browsing may refuse storage; the cart then lasts for the visit.
  }
}

export function onGuestCartChange(listener) {
  const handle = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };

  window.addEventListener("storage", handle);

  return () => window.removeEventListener("storage", handle);
}
