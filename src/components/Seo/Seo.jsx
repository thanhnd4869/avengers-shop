import { useEffect } from "react";
import { useLocation } from "react-router";

import { APP_NAME, SITE_DESCRIPTION, SITE_URL } from "@constants/app";
import { imageUrl } from "@utils/media";

const DESCRIPTION_MAX = 160;
const SHARE_IMAGE_WIDTH = 1200;
const STRUCTURED_DATA_ID = "seo-structured-data";

/** A full URL for a path on this site; other sites' URLs are left alone. */
export function absoluteUrl(url) {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function summarize(text) {
  const plain = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > DESCRIPTION_MAX
    ? `${plain.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`
    : plain;
}

/** Finds or creates the `<meta>`/`<link>` matching `selector` in `<head>`. */
function headTag(tagName, selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(tagName);
    document.head.appendChild(element);
  }
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
}

function setMeta(key, content, attribute = "name") {
  const selector = `meta[${attribute}="${key}"]`;
  if (content) headTag("meta", selector, { [attribute]: key, content });
  else document.head.querySelector(selector)?.remove();
}

/**
 * The page's title, description, link previews (Open Graph and Twitter) and
 * canonical URL. Pages that only make sense to one visitor, such as the cart
 * or the account area, pass `noIndex` so search engines leave them out.
 * `structuredData` is schema.org JSON-LD, e.g. a product with its price.
 */
export default function Seo({
  title,
  description = SITE_DESCRIPTION,
  image,
  type = "website",
  path,
  noIndex = false,
  structuredData,
}) {
  const location = useLocation();
  const fullTitle = title ? `${title} | ${APP_NAME}` : `${APP_NAME} – Genuine game keys`;
  const summary = summarize(description) || SITE_DESCRIPTION;
  // Query strings are filters and pages of the same listing, not new pages.
  const canonical = absoluteUrl(path ?? location.pathname);
  const shareImage = image ? absoluteUrl(imageUrl(image, { width: SHARE_IMAGE_WIDTH })) : "";
  const json = structuredData ? JSON.stringify(structuredData) : "";

  useEffect(() => {
    document.title = fullTitle;
    setMeta("description", summary);
    setMeta("robots", noIndex ? "noindex, nofollow" : "index, follow");
    setMeta("og:site_name", APP_NAME, "property");
    setMeta("og:type", type, "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", summary, "property");
    setMeta("og:url", canonical, "property");
    setMeta("og:image", shareImage, "property");
    setMeta("twitter:card", shareImage ? "summary_large_image" : "summary");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", summary);
    setMeta("twitter:image", shareImage);

    if (noIndex) document.head.querySelector('link[rel="canonical"]')?.remove();
    else headTag("link", 'link[rel="canonical"]', { rel: "canonical", href: canonical });

    const script = document.getElementById(STRUCTURED_DATA_ID);
    if (json) {
      const element = script ?? document.createElement("script");
      element.id = STRUCTURED_DATA_ID;
      element.type = "application/ld+json";
      element.textContent = json;
      if (!script) document.head.appendChild(element);
    } else {
      script?.remove();
    }
  }, [fullTitle, summary, noIndex, type, canonical, shareImage, json]);

  return null;
}
