import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { useLocation } from "react-router";

import ProviderLogo from "@components/ProviderLogo";
import { OAUTH_PROVIDERS } from "@constants/oauth";
import { startOAuth } from "@services/authService";
import { apiFormError } from "@utils/validation";

/**
 * For an account without a password: asks the visitor to confirm with one of
 * their connected providers before a sensitive change, then brings them back
 * to the same page.
 */
function ConfirmWithProvider({ identities, message }) {
  const location = useLocation();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");

  const handleClick = async (provider) => {
    setPending(provider);
    setError("");

    try {
      await startOAuth(provider, { intent: "reauth", redirect: location.pathname });
    } catch (requestError) {
      setError(apiFormError(requestError));
      setPending("");
    }
  };

  return (
    <Alert variant="warning" className="auth-card__alert mb-0" role="alert">
      <p className="mb-2">{message}</p>
      {error ? <p className="mb-2">{error}</p> : null}
      <div className="d-flex flex-wrap gap-2">
        {identities.map((identity) => (
          <Button
            key={identity.provider}
            variant="outline-light"
            size="sm"
            onClick={() => handleClick(identity.provider)}
            disabled={pending !== ""}
          >
            <ProviderLogo provider={identity.provider} size={14} />{" "}
            {pending === identity.provider
              ? "Redirecting..."
              : `Confirm with ${OAUTH_PROVIDERS[identity.provider]?.label ?? identity.provider}`}
          </Button>
        ))}
      </div>
    </Alert>
  );
}

export default ConfirmWithProvider;
