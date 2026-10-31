import { useCallback, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import { Link, useParams } from "react-router";

import OrderSummary, { OrderStatusBadge } from "@components/OrderSummary";
import useAsync from "@hooks/useAsync";
import useCart from "@hooks/useCart";
import { buildPath, PATHS } from "@routes/paths";
import { cancelOrder, getOrder } from "@services/orderService";

import "./CheckoutPage.css";

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);

  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Counts down from the server's `secondsLeft` using the monotonic clock, so a
 * wrong device clock cannot show the shopper more (or less) time than the API
 * will give them. Calls `onExpire` once it reaches zero.
 */
function useCountdown(secondsLeft, onExpire) {
  const [left, setLeft] = useState(secondsLeft);

  useEffect(() => {
    if (secondsLeft == null) return undefined;

    const startedAt = performance.now();
    let expired = false;
    const tick = () => {
      const next = Math.max(secondsLeft - Math.floor((performance.now() - startedAt) / 1000), 0);

      setLeft(next);

      if (next === 0 && !expired) {
        expired = true;
        onExpire();
      }
    };

    tick();
    const timer = setInterval(tick, 250);

    return () => clearInterval(timer);
    // `onExpire` changes every render; the countdown restarts only for a new
    // deadline from the server.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return left;
}

function PendingPanel({ order, onChanged }) {
  const { reload: reloadCart } = useCart();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const left = useCountdown(order.secondsLeft, onChanged);
  const urgent = left <= 60;

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order? Its keys go back on sale.")) return;

    setCancelling(true);
    setError("");

    try {
      await cancelOrder(order.number);
    } catch (cause) {
      // Paid or expired in the meantime: the page shows what happened.
      if (cause.code !== "ORDER_NOT_PENDING") setError(cause.message);
    } finally {
      setCancelling(false);
      reloadCart();
      onChanged();
    }
  };

  return (
    <aside className="checkout-page__panel rounded" aria-label="Payment">
      <p className={`checkout-page__timer ${urgent ? "is-urgent" : ""}`} role="timer">
        <span>Keys held for</span>
        <strong aria-live={urgent ? "polite" : "off"}>{formatCountdown(left)}</strong>
      </p>
      <p className="checkout-page__hint">
        Your keys are reserved for you. Pay before the timer runs out, or they go back on sale.
      </p>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Button variant="primary" className="w-100" disabled title="Payment opens soon">
        Pay with VNPay
      </Button>
      <p className="checkout-page__note">Online payment with VNPay is coming next.</p>

      <Button
        variant="link"
        className="checkout-page__cancel w-100"
        disabled={cancelling}
        onClick={handleCancel}
      >
        {cancelling ? "Cancelling…" : "Cancel order"}
      </Button>
    </aside>
  );
}

function EndedPanel({ order }) {
  const messages = {
    paid: "Payment received. Your keys are below and in your account.",
    expired: "Time ran out before payment, so the keys went back on sale.",
    cancelled: "This order was cancelled. Nothing was charged.",
  };

  return (
    <aside className="checkout-page__panel rounded" aria-label="Order status">
      <p className="checkout-page__ended">{messages[order.status]}</p>
      <div className="d-grid gap-2">
        {order.status === "paid" ? (
          <Button
            as={Link}
            to={buildPath(PATHS.ACCOUNT_ORDER, { number: order.number })}
            variant="primary"
          >
            View my keys
          </Button>
        ) : (
          <Button as={Link} to={PATHS.CART} variant="primary">
            Back to cart
          </Button>
        )}
        <Button as={Link} to={PATHS.ACCOUNT_ORDERS} variant="secondary">
          All orders
        </Button>
      </div>
    </aside>
  );
}

export function Component() {
  const { number } = useParams();
  const [version, setVersion] = useState(0);
  const { data, isLoading, error } = useAsync(() => getOrder(number), [number, version]);
  const [order, setOrder] = useState(null);

  // Keeps the last order on screen while it is read again after a change.
  if (data?.data && data.data !== order) setOrder(data.data);

  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  if (!order && isLoading) {
    return (
      <Container className="checkout-page">
        <h1 className="checkout-page__title">Checkout</h1>
        <Placeholder as="div" animation="glow" aria-label="Loading your order">
          <Placeholder xs={12} className="checkout-page__placeholder rounded" />
        </Placeholder>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="checkout-page">
        <h1 className="checkout-page__title">Checkout</h1>
        <div className="checkout-page__missing rounded" role="alert">
          <p>
            {error?.status === 404 ? "This order does not exist." : "We could not load this order."}
          </p>
          <Button as={Link} to={PATHS.CART} variant="primary">
            Back to cart
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="checkout-page">
      <h1 className="checkout-page__title">Checkout</h1>
      <p className="checkout-page__number">
        Order <strong>{order.number}</strong> <OrderStatusBadge status={order.status} />
      </p>

      <div className="checkout-page__layout">
        <section className="checkout-page__order rounded" aria-label="Order">
          <OrderSummary order={order} />
        </section>

        {order.status === "pending" ? (
          <PendingPanel key={order.expiresAt} order={order} onChanged={refresh} />
        ) : (
          <EndedPanel order={order} />
        )}
      </div>
    </Container>
  );
}

Component.displayName = "CheckoutPage";
