import { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { Link } from "react-router";

import Icon from "@components/Icon";
import useCart from "@hooks/useCart";
import { buildPath, PATHS } from "@routes/paths";
import { formatMoney } from "@utils/format";

import "./MiniCart.css";

// A quick look, not the whole cart: past this many lines the menu links to
// the cart page instead of growing a long scrolling list.
const PREVIEW_LINES = 5;

/**
 * Cart icon with a count badge, opening a short summary of the cart: each
 * line with its price, the total, and a link to the cart.
 *
 * Keys have no shipping, tax or discounts yet, so the API's `subtotal` is
 * what the shopper pays and is labelled as the total.
 */
function MiniCart({ id }) {
  const { cart, itemCount, status, isUpdating, removeItem } = useCart();
  const [show, setShow] = useState(false);
  // Each rise in the count replays the add animation: the key remounts the
  // icon and badge. Loading the cart when the page opens is not an add, so
  // only a rise seen while the cart was already loaded counts.
  const [bump, setBump] = useState({ count: itemCount, key: 0, ready: status === "ready" });

  if (bump.count !== itemCount || bump.ready !== (status === "ready")) {
    const rose = bump.ready && status === "ready" && itemCount > bump.count;

    setBump({
      count: itemCount,
      key: rose ? bump.key + 1 : bump.key,
      ready: status === "ready",
    });
  }

  const { items, summary } = cart;
  const hiddenLines = Math.max(items.length - PREVIEW_LINES, 0);

  return (
    <Dropdown align="end" show={show} onToggle={setShow} className="mini-cart">
      <Dropdown.Toggle
        id={id}
        className="header__icon-button mini-cart__toggle"
        aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      >
        <span
          key={bump.key}
          className={`mini-cart__icon${bump.key ? " mini-cart__icon--bump" : ""}`}
        >
          <Icon name="cart" size={16} />
          {itemCount > 0 ? (
            <span className="header__cart-count">{itemCount > 99 ? "99+" : itemCount}</span>
          ) : null}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="mini-cart__menu">
        {status === "loading" ? (
          <p className="mini-cart__empty mb-0">Loading your cart…</p>
        ) : status === "error" ? (
          <p className="mini-cart__empty mb-0">We could not load your cart.</p>
        ) : items.length === 0 ? (
          <div className="mini-cart__empty">
            <p>Your cart is empty.</p>
            <Button
              as={Link}
              to={PATHS.SHOP}
              variant="primary"
              size="sm"
              onClick={() => setShow(false)}
            >
              Browse the shop
            </Button>
          </div>
        ) : (
          <>
            <ul className="mini-cart__items">
              {items.slice(0, PREVIEW_LINES).map((item) => (
                <li key={item.variantId} className="mini-cart__item">
                  <Link
                    to={buildPath(PATHS.PRODUCT, { slug: item.product.slug })}
                    className="mini-cart__thumb sf-media sf-ratio-3x4 rounded"
                    onClick={() => setShow(false)}
                  >
                    <img src={item.product.image.url} alt="" loading="lazy" />
                  </Link>
                  <div className="mini-cart__details">
                    <Link
                      to={buildPath(PATHS.PRODUCT, { slug: item.product.slug })}
                      className="mini-cart__name"
                      title={item.product.name}
                      onClick={() => setShow(false)}
                    >
                      {item.product.name}
                    </Link>
                    <span className="mini-cart__meta">
                      {item.platform.name}
                      {item.edition && item.edition !== "Standard" ? ` · ${item.edition}` : ""}
                    </span>
                    <span className="mini-cart__price">
                      {item.status === "sold_out"
                        ? "Sold out"
                        : `${item.quantity} × ${formatMoney(item.price, item.currency)}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mini-cart__remove"
                    aria-label={`Remove ${item.product.name} (${item.platform.name})`}
                    disabled={isUpdating}
                    onClick={() => removeItem(item.variantId).catch(() => {})}
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </li>
              ))}
            </ul>
            {hiddenLines > 0 ? (
              <Link to={PATHS.CART} className="mini-cart__more" onClick={() => setShow(false)}>
                +{hiddenLines} more {hiddenLines === 1 ? "game" : "games"} in your cart
              </Link>
            ) : null}
            <div className="mini-cart__footer">
              <p className="mini-cart__subtotal">
                <span>Total</span>
                <strong>{formatMoney(summary.subtotal, summary.currency)}</strong>
              </p>
              <div className="d-grid gap-2">
                <Button
                  as={Link}
                  to={PATHS.CART}
                  variant="primary"
                  size="sm"
                  onClick={() => setShow(false)}
                >
                  View cart
                </Button>
              </div>
            </div>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default MiniCart;
