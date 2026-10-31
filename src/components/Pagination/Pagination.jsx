import { Link } from "react-router";

import Icon from "@components/Icon";

import "./Pagination.css";

const SIBLINGS = 1;

/**
 * Page numbers to show: the first and last page, the current one with its
 * neighbours, and a gap marker wherever pages are skipped.
 */
function pageItems(page, totalPages) {
  const items = [];

  for (let number = 1; number <= totalPages; number += 1) {
    if (number === 1 || number === totalPages || Math.abs(number - page) <= SIBLINGS) {
      items.push(number);
    } else if (items.at(-1) !== "gap") {
      items.push("gap");
    }
  }

  return items;
}

/**
 * Numbered page links. `hrefFor(page)` builds each link, so the page number
 * lives in the URL and the browser's back button steps through pages.
 */
function Pagination({ page, totalPages, hrefFor, className = "" }) {
  if (totalPages <= 1) {
    return null;
  }

  const link = (target, children, label) => (
    <Link to={hrefFor(target)} className="sf-pagination__link rounded" aria-label={label}>
      {children}
    </Link>
  );

  return (
    <nav className={`sf-pagination ${className}`} aria-label="Pagination">
      <ul className="list-unstyled d-flex flex-wrap justify-content-center gap-2 mb-0">
        {page > 1 ? (
          <li>{link(page - 1, <Icon name="chevron-left" size={12} />, "Previous page")}</li>
        ) : null}
        {pageItems(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} className="sf-pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              {item === page ? (
                <span className="sf-pagination__link rounded is-active" aria-current="page">
                  {item}
                </span>
              ) : (
                link(item, item, `Page ${item}`)
              )}
            </li>
          ),
        )}
        {page < totalPages ? (
          <li>{link(page + 1, <Icon name="chevron-right" size={12} />, "Next page")}</li>
        ) : null}
      </ul>
    </nav>
  );
}

export default Pagination;
