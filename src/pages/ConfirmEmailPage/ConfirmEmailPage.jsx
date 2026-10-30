import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { Link, useSearchParams } from "react-router";

import AuthLayout from "@components/AuthLayout";
import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import { confirmEmailChange } from "@services/authService";

// The token works once, but StrictMode (and a remount) runs the effect twice.
// Sharing the request per token keeps the second run from reporting failure.
const pending = new Map();

function confirmOnce(token) {
  if (!pending.has(token)) {
    pending.set(token, confirmEmailChange(token));
  }

  return pending.get(token);
}

export function Component() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { status, updateUser } = useAuth();
  const [state, setState] = useState(token ? "confirming" : "invalid");
  const [error, setError] = useState(null);
  const [confirmedUser, setConfirmedUser] = useState(null);

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    confirmOnce(token)
      .then((user) => {
        if (cancelled) return;
        setConfirmedUser(user);
        setState("confirmed");
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError);
        setState("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // As on the verify page, the session restored on load may still carry the
  // old address, so the confirmed user is applied once it is known.
  useEffect(() => {
    if (confirmedUser && status === "authenticated") {
      updateUser(confirmedUser);
    }
  }, [confirmedUser, status, updateUser]);

  const signedIn = status === "authenticated";

  return (
    <AuthLayout highlight="Confirm" title="new email">
      {state === "confirming" ? (
        <div className="d-flex align-items-center gap-3" role="status">
          <Spinner animation="border" size="sm" variant="primary" />
          Confirming your new email address...
        </div>
      ) : null}

      {state === "confirmed" ? (
        <div className="d-grid gap-3">
          <Alert variant="success" className="mb-0">
            Your email address is now <strong>{confirmedUser.email}</strong>. Use it the next time
            you sign in.
          </Alert>
          <Button as={Link} to={signedIn ? PATHS.ACCOUNT_PROFILE : PATHS.LOGIN} variant="primary">
            {signedIn ? "Back to my account" : "Sign in"}
          </Button>
        </div>
      ) : null}

      {state === "invalid" ? (
        <div className="d-grid gap-3">
          <Alert variant="danger" className="mb-0" role="alert">
            {error?.code === "EMAIL_TAKEN"
              ? "Another account started using this email address in the meantime, so the change could not be applied."
              : "This link is invalid or has expired. Request the change again from your account page."}
          </Alert>
          <Button as={Link} to={PATHS.ACCOUNT_PROFILE} variant="primary">
            Go to my account
          </Button>
        </div>
      ) : null}
    </AuthLayout>
  );
}

Component.displayName = "ConfirmEmailPage";
