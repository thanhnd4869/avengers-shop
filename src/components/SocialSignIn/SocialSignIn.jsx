import { useState } from "react";
import Alert from "react-bootstrap/Alert";

import ProviderLogo from "@components/ProviderLogo";
import { OAUTH_PROVIDERS } from "@constants/oauth";
import useOAuthProviders from "@hooks/useOAuthProviders";
import { startOAuth } from "@services/authService";
import { apiFormError } from "@utils/validation";

import "./SocialSignIn.css";

/**
 * "Continue with Google / Facebook", placed below the email form as the
 * alternative. Both buttons share one neutral style that matches the site's
 * inputs, so the form's red submit stays the main action; each provider is
 * told apart by its official logo. Renders nothing until the API says which
 * providers it offers.
 */
function SocialSignIn({ remember = false, redirect, label = "Continue with" }) {
  const { providers } = useOAuthProviders();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");

  if (providers.length === 0) return null;

  const handleClick = async (provider) => {
    setPending(provider);
    setError("");

    try {
      // Leaves the page on success.
      await startOAuth(provider, { remember, redirect });
    } catch (requestError) {
      setError(apiFormError(requestError));
      setPending("");
    }
  };

  return (
    <div className="social-sign-in">
      <p className="social-sign-in__divider">
        <span>or</span>
      </p>

      {error ? (
        <Alert variant="danger" className="auth-card__alert" role="alert">
          {error}
        </Alert>
      ) : null}

      <div className="social-sign-in__buttons">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            className="social-sign-in__button"
            onClick={() => handleClick(provider)}
            disabled={pending !== ""}
          >
            <ProviderLogo provider={provider} />
            <span>
              {pending === provider
                ? "Redirecting..."
                : `${label} ${OAUTH_PROVIDERS[provider].label}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SocialSignIn;
