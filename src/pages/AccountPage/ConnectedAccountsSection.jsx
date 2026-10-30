import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import ProviderLogo from "@components/ProviderLogo";
import { OAUTH_PROVIDERS } from "@constants/oauth";
import useAuth from "@hooks/useAuth";
import useOAuthProviders from "@hooks/useOAuthProviders";
import { PATHS } from "@routes/paths";
import { startOAuth, unlinkIdentity } from "@services/authService";

import { accountErrors } from "./accountErrors";

/**
 * Google and Facebook accounts the visitor can sign in with. Removing the
 * last way to sign in is refused by the API; the button says why up front.
 */
function ConnectedAccountsSection({ identities, isLoading, setList }) {
  const { user } = useAuth();
  const { providers } = useOAuthProviders();
  const [pending, setPending] = useState("");
  const [formError, setFormError] = useState("");

  const byProvider = Object.fromEntries(identities.map((item) => [item.provider, item]));
  // Providers turned off on the API still show if the account is linked, so
  // the visitor can see and remove them.
  const shown = [...new Set([...providers, ...identities.map((item) => item.provider)])];
  const isLastMethod = !user.hasPassword && identities.length <= 1;

  const handleConnect = async (provider) => {
    setPending(provider);
    setFormError("");

    try {
      await startOAuth(provider, { intent: "link", redirect: PATHS.ACCOUNT_SECURITY });
    } catch (error) {
      setFormError(accountErrors(error).form);
      setPending("");
    }
  };

  const handleDisconnect = async (provider) => {
    setPending(provider);
    setFormError("");

    try {
      setList(await unlinkIdentity(provider));
    } catch (error) {
      setFormError(accountErrors(error).form);
    } finally {
      setPending("");
    }
  };

  if (shown.length === 0) return null;

  return (
    <section className="auth-card account-card rounded" aria-labelledby="account-connected-title">
      <h2 id="account-connected-title" className="account-card__title">
        Connected accounts
      </h2>
      <p className="account-card__intro">Sign in faster with an account you already have.</p>

      {formError ? (
        <Alert variant="danger" className="auth-card__alert" role="alert">
          {formError}
        </Alert>
      ) : null}

      {isLoading ? (
        <Spinner animation="border" size="sm" variant="primary" role="status" />
      ) : (
        <ul className="connected-accounts list-unstyled mb-0">
          {shown.map((provider) => {
            const identity = byProvider[provider];
            const details = OAUTH_PROVIDERS[provider] ?? { label: provider };

            return (
              <li key={provider} className="connected-accounts__item">
                <span className="connected-accounts__icon">
                  <ProviderLogo provider={provider} size={20} />
                </span>
                <span className="connected-accounts__text">
                  <span className="connected-accounts__name">{details.label}</span>
                  <span className="connected-accounts__status" title={identity?.email ?? ""}>
                    {identity ? (identity.email ?? "Connected") : "Not connected"}
                  </span>
                </span>
                {identity ? (
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => handleDisconnect(provider)}
                    disabled={pending !== "" || isLastMethod}
                    title={
                      isLastMethod
                        ? "Set a password or connect another account first, so you can still sign in."
                        : undefined
                    }
                  >
                    {pending === provider ? "Removing..." : "Disconnect"}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConnect(provider)}
                    disabled={pending !== "" || !providers.includes(provider)}
                  >
                    {pending === provider ? "Redirecting..." : "Connect"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isLastMethod && identities.length === 1 ? (
        <p className="account-card__hint">
          This is your only way to sign in. Set a password or connect another account before
          removing it.
        </p>
      ) : null}
    </section>
  );
}

export default ConnectedAccountsSection;
