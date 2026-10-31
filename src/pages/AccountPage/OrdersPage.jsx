import Button from "react-bootstrap/Button";
import Placeholder from "react-bootstrap/Placeholder";
import { Link, useSearchParams } from "react-router";

import { OrderStatusBadge } from "@components/OrderSummary";
import Pagination from "@components/Pagination";
import useAsync from "@hooks/useAsync";
import { buildPath, PATHS } from "@routes/paths";
import { getOrders } from "@services/orderService";
import { formatDate, formatMoney } from "@utils/format";

const PAGE_SIZE = 10;

/** Where an order's row leads: an unpaid order back to its checkout. */
function orderHref(order) {
  return order.status === "pending"
    ? buildPath(PATHS.CHECKOUT, { number: order.number })
    : buildPath(PATHS.ACCOUNT_ORDER, { number: order.number });
}

export function Component() {
  const [searchParams] = useSearchParams();
  const page = Math.max(Number.parseInt(searchParams.get("page"), 10) || 1, 1);
  const { data, isLoading, error } = useAsync(() => getOrders({ page, limit: PAGE_SIZE }), [page]);
  const orders = data?.data ?? [];

  return (
    <div className="account-page__sections account-orders">
      <section className="auth-card account-card rounded">
        <h2 className="account-card__title">Orders</h2>

        {isLoading ? (
          <Placeholder as="div" animation="glow" aria-label="Loading your orders">
            <Placeholder xs={12} />
            <Placeholder xs={10} />
            <Placeholder xs={11} />
          </Placeholder>
        ) : error ? (
          <p className="mb-0" role="alert">
            We could not load your orders. Please try again.
          </p>
        ) : orders.length === 0 ? (
          <div className="account-orders__empty">
            <p>You have not ordered anything yet.</p>
            <Button as={Link} to={PATHS.SHOP} variant="primary">
              Browse the shop
            </Button>
          </div>
        ) : (
          <>
            <ul className="account-orders__list">
              {orders.map((order) => (
                <li key={order.number}>
                  <Link to={orderHref(order)} className="account-orders__row">
                    <span className="account-orders__number">{order.number}</span>
                    <OrderStatusBadge status={order.status} />
                    <span className="account-orders__date">{formatDate(order.createdAt)}</span>
                    <span className="account-orders__count">
                      {order.itemCount} {order.itemCount === 1 ? "key" : "keys"}
                    </span>
                    <strong className="account-orders__total">
                      {formatMoney(order.total, order.currency)}
                    </strong>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination
              className="mt-4"
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              hrefFor={(target) =>
                target > 1 ? `${PATHS.ACCOUNT_ORDERS}?page=${target}` : PATHS.ACCOUNT_ORDERS
              }
            />
          </>
        )}
      </section>
    </div>
  );
}

Component.displayName = "AccountOrdersPage";
