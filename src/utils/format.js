/**
 * Formats a price range the way the storefront displays it.
 *
 * A game key is sold per platform at different prices, so a product often shows
 * a range rather than a single value.
 */
export function formatPriceRange(min, max, currency = "VND") {
  const format = (value) => formatMoney(value, currency);

  return min === max ? format(min) : `${format(min)} - ${format(max)}`;
}

// Each currency in the way its own shoppers write it: "649.000 ₫" for VND,
// "$26.00" for USD.
const CURRENCY_LOCALES = { VND: "vi-VN", USD: "en-US" };

/**
 * Formats an amount of money. VND has no minor unit, so it is shown in whole
 * đồng.
 */
export function formatMoney(value, currency = "VND") {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? "en-US", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Formats a date using the browser locale.
 */
export function formatDate(value, locale = undefined) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/**
 * Joins truthy class names into a single string.
 */
export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}
