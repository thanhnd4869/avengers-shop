import { APP_NAME } from "@constants/app";

import "./BrandLogo.css";

/**
 * The store's mark (the same red "A" as `public/assets/favicon.svg`) beside
 * the name. The name is HTML text rather than part of the SVG, so it is set in
 * the site's heading font and read out by screen readers.
 */
function BrandLogo({ className = "" }) {
  const [first, ...rest] = APP_NAME.split(" ");

  return (
    <span className={`brand-logo ${className}`.trim()}>
      <svg className="brand-logo__mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="12" fill="#181c23" />
        <path d="M32 10 52 54H42l-3.6-8.4H25.6L22 54H12Z" fill="#dd163b" />
        <path d="M32 27.5 28.3 37h7.4Z" fill="#181c23" />
      </svg>
      <span className="brand-logo__name">
        {first}
        {rest.length ? <span className="brand-logo__accent"> {rest.join(" ")}</span> : null}
      </span>
    </span>
  );
}

export default BrandLogo;
