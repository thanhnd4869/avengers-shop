import { useEffect, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { Link, useNavigate, useSearchParams } from "react-router";

import AuthLayout from "@components/AuthLayout";
import { oauthErrorMessage, providerLabel } from "@constants/oauth";
import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import { safeRedirect } from "@utils/validation";

/**
 * Where the API sends the visitor after Google or Facebook. On success the
 * refresh cookie is already set, so the session is picked up and the visitor
 * moves on; otherwise the reason is explained.
 */
export function Component() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { reloadSession } = useAuth();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const status = searchParams.get("status");
  const error = searchParams.get("error");
  const provider = providerLabel(searchParams.get("provider") ?? "");
  const next = safeRedirect(searchParams.get("next"), PATHS.HOME);

  useEffect(() => {
    if (error || !status || started.current) return;

    // StrictMode runs effects twice; one refresh is enough.
    started.current = true;

    const notice =
      status === "linked"
        ? `${provider} is now connected to your account.`
        : status === "confirmed"
          ? `Thanks, you confirmed it is you with ${provider}.`
          : "";

    reloadSession()
      .then(() => navigate(next, { replace: true, state: notice ? { notice } : undefined }))
      .catch(() => setFailed(true));
  }, [error, status, provider, next, navigate, reloadSession]);

  if (error || failed || !status) {
    return (
      <AuthLayout highlight="Sign" title="in">
        <div className="d-grid gap-3">
          <Alert variant="danger" className="mb-0" role="alert">
            {error ? oauthErrorMessage(error) : oauthErrorMessage("try_again")}
          </Alert>
          <Button as={Link} to={next.startsWith(PATHS.ACCOUNT) ? next : PATHS.LOGIN}>
            {next.startsWith(PATHS.ACCOUNT) ? "Back to my account" : "Back to sign in"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout highlight="Sign" title="in">
      <div className="d-flex align-items-center gap-3" role="status">
        <Spinner animation="border" size="sm" variant="primary" />
        Finishing sign-in with {provider}...
      </div>
    </AuthLayout>
  );
}

Component.displayName = "OAuthCallbackPage";
