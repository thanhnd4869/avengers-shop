import { useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import { Link, useLocation, useNavigate } from "react-router";

import Icon from "@components/Icon";
import MediaImage from "@components/MediaImage";
import QuantityInput from "@components/QuantityInput";
import useCart from "@hooks/useCart";
import { buildPath, PATHS } from "@routes/paths";
import { createOrder } from "@services/orderService";
import { formatMoney } from "@utils/format";

function newIdempotencyKey() {
  return crypto.randomUUID();
}

import "./CartPage.css";

function lineMessage(item) {
  if (item.status === "sold_out") return "Sold out on this platform. Remove it to continue.";
  if (item.status === "limited")
    return `Only ${item.maxQuantity} left. Lower the quantity to continue.`;

  return "";
}

function CartLine({ item, disabled, onQuantity, onRemove }) {
  const href = buildPath(PATHS.PRODUCT, { slug: item.product.slug });
  const message = lineMessage(item);

  return (
    <li className={`cart-line ${item.status !== "ok" ? "has-problem" : ""}`}>
      <Link to={href} className="cart-line__thumb sf-media sf-ratio-3x4 rounded">
        <MediaImage width={160} src={item.product.image.url} alt="" loading="lazy" />
      </Link>

      <div className="cart-line__info">
        <Link to={href} className="cart-line__name" title={item.product.name}>
          {item.product.name}
        </Link>
        <span className="cart-line__meta">
          {item.platform.name}
          {item.edition && item.edition !== "Standard" ? ` · ${item.edition}` : ""}
        </span>
        <span className="cart-line__unit">
          {item.originalPrice ? (
            <s className="me-2">{formatMoney(item.originalPrice, item.currency)}</s>
          ) : null}
          {formatMoney(item.price, item.currency)}
        </span>
        {message ? (
          <span className="cart-line__problem" role="status">
            {message}
          </span>
        ) : null}
      </div>

      <div className="cart-line__quantity">
        {item.status === "sold_out" ? (
          <span className="cart-line__sold-out">Sold out</span>
        ) : (
          <QuantityInput
            value={item.quantity}
            max={Math.max(item.maxQuantity, 1)}
            disabled={disabled}
            label={`Quantity of ${item.product.name}`}
            onChange={onQuantity}
          />
        )}
      </div>

      <strong className="cart-line__total">
        {item.status === "sold_out" ? "–" : formatMoney(item.lineTotal, item.currency)}
      </strong>

      <button
        type="button"
        className="cart-line__remove"
        aria-label={`Remove ${item.product.name} (${item.platform.name})`}
        disabled={disabled}
        onClick={onRemove}
      >
        <Icon name="trash" size={15} />
      </button>
    </li>
  );
}

export function Component() {
  const location = useLocation();
  const {
    cart,
    status,
    isGuest,
    isUpdating,
    notice,
    clearNotice,
    reload,
    setQuantity,
    removeItem,
    clear,
  } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pendingNumber, setPendingNumber] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  // One key per checkout attempt: kept while the request is retried or
  // clicked twice, replaced once the attempt ends either way.
  const attemptKey = useRef(null);
  const { items, summary } = cart;

  const run = (action) => {
    setError("");
    action().catch((cause) => {
      if (cause.code !== "STALE") setError(cause.message);
    });
  };

  const handleCheckout = async () => {
    setError("");
    setPendingNumber(null);
    setCheckingOut(true);
    attemptKey.current ??= newIdempotencyKey();

    try {
      const { data: order } = await createOrder({
        idempotencyKey: attemptKey.current,
        expectedTotal: summary.subtotal,
      });

      attemptKey.current = null;
      navigate(buildPath(PATHS.CHECKOUT, { number: order.number }));
    } catch (cause) {
      // A network failure may have reached the API, so the same key is kept
      // for the retry; any answer from the API ends this attempt.
      if (cause.status) attemptKey.current = null;

      if (cause.code === "PENDING_ORDER_EXISTS") {
        setPendingNumber(cause.details?.[0]?.number ?? null);
      } else if (["PRICE_CHANGED", "OUT_OF_STOCK", "CART_NOT_READY"].includes(cause.code)) {
        // The cart shown is out of date; fetch it again so the shopper sees
        // what changed.
        reload();
      }

      setError(cause.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (status === "loading") {
    return (
      <Container className="cart-page">
        <h1 className="cart-page__title">Cart</h1>
        <Placeholder as="div" animation="glow" aria-label="Loading your cart">
          <Placeholder xs={12} className="cart-page__placeholder rounded" />
          <Placeholder xs={12} className="cart-page__placeholder rounded" />
        </Placeholder>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container className="cart-page">
        <h1 className="cart-page__title">Cart</h1>
        <div className="cart-page__empty rounded" role="alert">
          <p>We could not load your cart.</p>
          <Button variant="primary" onClick={reload}>
            Try again
          </Button>
        </div>
      </Container>
    );
  }

  if (!items.length) {
    return (
      <Container className="cart-page">
        <h1 className="cart-page__title">Cart</h1>
        {notice ? (
          <Alert variant="info" dismissible onClose={clearNotice}>
            {notice}
          </Alert>
        ) : null}
        <div className="cart-page__empty rounded">
          <Icon name="cart" size={36} className="mb-3" />
          <p>Your cart is currently empty.</p>
          <Button as={Link} to={PATHS.SHOP} variant="primary">
            Return to shop
          </Button>
        </div>
      </Container>
    );
  }

  const loginTo = `${PATHS.LOGIN}?redirect=${encodeURIComponent(location.pathname)}`;
  const total = formatMoney(summary.subtotal, summary.currency);
  const checkoutButton = isGuest ? (
    <Button as={Link} to={loginTo} variant="primary" className="w-100">
      Sign in to check out
    </Button>
  ) : (
    <Button
      variant="primary"
      className="w-100"
      disabled={!summary.canCheckout || isUpdating || checkingOut}
      onClick={handleCheckout}
    >
      {checkingOut ? "Holding your keys…" : "Proceed to checkout"}
    </Button>
  );

  return (
    <Container className="cart-page">
      <h1 className="cart-page__title">
        Cart{" "}
        <span className="cart-page__count">
          ({items.length} {items.length === 1 ? "game" : "games"})
        </span>
      </h1>

      {notice ? (
        <Alert variant="info" dismissible onClose={clearNotice}>
          {notice}
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
          {pendingNumber ? (
            <>
              {" "}
              <Link to={buildPath(PATHS.CHECKOUT, { number: pendingNumber })}>
                Go to order {pendingNumber}
              </Link>
            </>
          ) : null}
        </Alert>
      ) : null}

      <div className="cart-page__layout">
        <section aria-label="Games in your cart" className="cart-page__lines rounded">
          <ul className="list-unstyled mb-0">
            {items.map((item) => (
              <CartLine
                key={item.variantId}
                item={item}
                disabled={isUpdating}
                onQuantity={(quantity) => run(() => setQuantity(item.variantId, quantity))}
                onRemove={() => run(() => removeItem(item.variantId))}
              />
            ))}
          </ul>
          <div className="cart-page__lines-footer">
            <Link to={PATHS.SHOP} className="sf-link-muted">
              ← Continue shopping
            </Link>
            <Button
              variant="link"
              className="cart-page__clear p-0"
              disabled={isUpdating}
              onClick={() => {
                if (window.confirm("Remove every game from your cart?")) run(clear);
              }}
            >
              Clear cart
            </Button>
          </div>
          {/* Below lg the totals come after every line, which on a long cart
              is far down the page. This bar sticks to the bottom of the
              screen while the lines scroll past and comes to rest at the end
              of the list. Hidden from lg, where the totals box stays in view. */}
          <div className="cart-page__sticky-bar">
            <div className="cart-page__sticky-total">
              <span>Total</span>
              <strong>{total}</strong>
            </div>
            {checkoutButton}
          </div>
        </section>

        <aside className="cart-page__summary rounded" aria-label="Order summary">
          <h2 className="cart-page__summary-title">Cart totals</h2>
          <dl className="cart-page__totals">
            <div>
              <dt>Items</dt>
              <dd>{summary.itemCount}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Digital key, instant</dd>
            </div>
            <div className="cart-page__grand-total">
              <dt>Total</dt>
              <dd>{total}</dd>
            </div>
          </dl>

          {!summary.canCheckout ? (
            <p className="cart-page__blocked">Fix the highlighted games to continue.</p>
          ) : null}

          {/* Guests are asked to sign in first, since keys are delivered to
              an account. */}
          {checkoutButton}
          <p className="cart-page__note">
            {isGuest
              ? "Your cart is kept when you sign in."
              : "Your keys are held for 10 minutes while you pay."}
          </p>
        </aside>
      </div>
    </Container>
  );
}

Component.displayName = "CartPage";
