import Button from "react-bootstrap/Button";
import Placeholder from "react-bootstrap/Placeholder";
import { Link, Navigate, useParams } from "react-router";

import OrderSummary, { OrderStatusBadge } from "@components/OrderSummary";
import useAsync from "@hooks/useAsync";
import { buildPath, PATHS } from "@routes/paths";
import { getOrder } from "@services/orderService";
import { formatDate } from "@utils/format";

const STATUS_NOTES = {
  paid: "Redeem each key on its platform's store. Keep them private: anyone with a key can use it.",
  expired: "Time ran out before payment. Nothing was charged and the keys went back on sale.",
  cancelled: "You cancelled this order. Nothing was charged.",
};

export function Component() {
  const { number } = useParams();
  const { data, isLoading, error } = useAsync(() => getOrder(number), [number]);
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="account-page__sections">
        <section className="auth-card account-card rounded">
          <Placeholder as="div" animation="glow" aria-label="Loading the order">
            <Placeholder xs={6} />
            <Placeholder xs={12} className="mt-3" />
          </Placeholder>
        </section>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="account-page__sections">
        <section className="auth-card account-card rounded">
          <p role="alert">
            {error?.status === 404 ? "This order does not exist." : "We could not load this order."}
          </p>
          <Button as={Link} to={PATHS.ACCOUNT_ORDERS} variant="primary">
            All orders
          </Button>
        </section>
      </div>
    );
  }

  // An unpaid order is finished on its checkout page.
  if (order.status === "pending") {
    return <Navigate to={buildPath(PATHS.CHECKOUT, { number: order.number })} replace />;
  }

  return (
    <div className="account-page__sections">
      <section className="auth-card account-card rounded">
        <Link to={PATHS.ACCOUNT_ORDERS} className="account-orders__back">
          ← All orders
        </Link>
        <h2 className="account-card__title account-orders__heading">
          <span>{order.number}</span> <OrderStatusBadge status={order.status} />
        </h2>
        <p className="account-card__intro">
          Placed on {formatDate(order.createdAt)}
          {order.paidAt ? `, paid on ${formatDate(order.paidAt)}` : ""}.
        </p>
        <p className="account-card__intro">{STATUS_NOTES[order.status]}</p>

        <OrderSummary order={order} />
      </section>
    </div>
  );
}

Component.displayName = "AccountOrderDetailPage";
