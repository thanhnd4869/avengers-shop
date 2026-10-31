import { useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import { Link, Navigate, useParams, useSearchParams } from "react-router";

import useCart from "@hooks/useCart";
import { buildPath, PATHS } from "@routes/paths";
import { confirmVnpayReturn } from "@services/orderService";

import "./PaymentResultPage.css";

// How often, and how many times, to ask again while VNPay has not settled
// the payment yet (its IPN normally arrives within seconds).
const POLL_MS = 3000;
const MAX_POLLS = 20;

/**
 * Where VNPay sends the shopper back. The parameters in the URL are only
 * handed to the API, which checks their signature and asks VNPay for the
 * result; nothing here trusts them. A payment still being processed is asked
 * about again for a while.
 */
export function Component() {
  const { number } = useParams();
  const [searchParams] = useSearchParams();
  const { reload: reloadCart } = useCart();
  const [state, setState] = useState({ status: "checking" });
  const params = useRef(Object.fromEntries(searchParams));

  useEffect(() => {
    let cancelled = false;
    let timer;
    let polls = 0;

    const check = async () => {
      try {
        const { data } = await confirmVnpayReturn(number, params.current);

        if (cancelled) return;

        const status = data.payment.status;

        if (status === "pending" && polls < MAX_POLLS) {
          polls += 1;
          setState({ status: "checking" });
          timer = setTimeout(check, POLL_MS);
          return;
        }

        // The bought games have left the cart on the server.
        if (status === "succeeded") reloadCart();

        setState({ status, responseCode: data.payment.responseCode });
      } catch (error) {
        if (!cancelled) setState({ status: "error", message: error.message });
      }
    };

    check();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // The URL's parameters are read once; `reloadCart` is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number]);

  const checkoutHref = buildPath(PATHS.CHECKOUT, { number });

  // A paid order shows its keys on the order page.
  if (state.status === "succeeded") {
    return <Navigate to={buildPath(PATHS.ACCOUNT_ORDER, { number })} replace />;
  }

  let body;

  if (state.status === "checking") {
    body = (
      <>
        <Spinner animation="border" role="status" className="mb-3" />
        <h1 className="payment-result__title">Confirming your payment</h1>
        <p>This usually takes a few seconds. Please keep this page open.</p>
      </>
    );
  } else if (state.status === "pending") {
    body = (
      <>
        <h1 className="payment-result__title">Payment still processing</h1>
        <p>
          VNPay has not confirmed the payment yet. Your keys will appear in your orders as soon as
          it does; you do not need to pay again.
        </p>
        <Button as={Link} to={PATHS.ACCOUNT_ORDERS} variant="primary">
          My orders
        </Button>
      </>
    );
  } else if (state.status === "refund_required") {
    body = (
      <>
        <h1 className="payment-result__title">Payment received, refund on its way</h1>
        <p>
          We received your payment but could not use it: the order was already paid, or its keys
          sold out first. The amount will be refunded to you.
        </p>
        <Button as={Link} to={PATHS.ACCOUNT_ORDERS} variant="primary">
          My orders
        </Button>
      </>
    );
  } else if (state.status === "failed") {
    body = (
      <>
        <h1 className="payment-result__title">Payment not completed</h1>
        <p>
          The payment was cancelled or declined, and nothing was charged. If the order is still
          open, you can try again.
        </p>
        <Button as={Link} to={checkoutHref} variant="primary">
          Back to the order
        </Button>
      </>
    );
  } else {
    body = (
      <>
        <h1 className="payment-result__title">We could not check this payment</h1>
        <p>{state.message}</p>
        <Button as={Link} to={checkoutHref} variant="primary">
          Back to the order
        </Button>
      </>
    );
  }

  return (
    <Container className="payment-result">
      <div className="payment-result__card rounded" aria-live="polite">
        {body}
      </div>
    </Container>
  );
}

Component.displayName = "PaymentResultPage";
