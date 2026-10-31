import { Link } from "react-router";

import { buildPath, PATHS } from "@routes/paths";
import { formatMoney } from "@utils/format";

import "./OrderSummary.css";

export const ORDER_STATUS_LABELS = Object.freeze({
  pending: "Awaiting payment",
  paid: "Paid",
  expired: "Expired",
  cancelled: "Cancelled",
});

export function OrderStatusBadge({ status }) {
  return (
    <span className={`order-status order-status--${status}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * The lines and total of an order as they were when it was placed. A paid
 * order's lines also list the keys it bought.
 */
function OrderSummary({ order }) {
  return (
    <div className="order-summary">
      <ul className="order-summary__items">
        {order.items.map((item) => (
          <li key={item.variantId} className="order-summary__item">
            <Link
              to={buildPath(PATHS.PRODUCT, { slug: item.product.slug })}
              className="order-summary__thumb sf-media sf-ratio-3x4 rounded"
            >
              <img src={item.product.image.url} alt="" loading="lazy" />
            </Link>
            <div className="order-summary__details">
              <Link
                to={buildPath(PATHS.PRODUCT, { slug: item.product.slug })}
                className="order-summary__name"
                title={item.product.name}
              >
                {item.product.name}
              </Link>
              <span className="order-summary__meta">
                {item.platform.name}
                {item.edition && item.edition !== "Standard" ? ` · ${item.edition}` : ""}
              </span>
              <span className="order-summary__unit">
                {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
              </span>
              {item.keys?.length ? (
                <ul className="order-summary__keys" aria-label={`Keys for ${item.product.name}`}>
                  {item.keys.map((code) => (
                    <li key={code}>
                      <code>{code}</code>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <strong className="order-summary__line-total">
              {formatMoney(item.lineTotal, order.currency)}
            </strong>
          </li>
        ))}
      </ul>
      <p className="order-summary__total">
        <span>Total</span>
        <strong>{formatMoney(order.total, order.currency)}</strong>
      </p>
    </div>
  );
}

export default OrderSummary;
