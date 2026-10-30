import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import { Link } from "react-router";

import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import { requestPasswordReset } from "@services/authService";

import { accountErrors } from "./accountErrors";

/**
 * Shown instead of "change password" for an account that signs in with
 * Google or Facebook only. The password is chosen through a link mailed to
 * the account's address, which proves the visitor reads that inbox.
 */
function SetPasswordSection() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    setSubmitting(true);
    setFormError("");

    try {
      await requestPasswordReset(user.email);
      setSent(true);
    } catch (error) {
      setFormError(accountErrors(error).form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card account-card rounded" aria-labelledby="account-password-title">
      <h2 id="account-password-title" className="account-card__title">
        Password
      </h2>
      <p className="account-card__intro">
        You sign in with a connected account. Add a password to also sign in with your email.
      </p>

      {formError ? (
        <Alert variant="danger" className="auth-card__alert" role="alert">
          {formError}
        </Alert>
      ) : null}

      {!user.email ? (
        <p className="account-card__hint mb-0">
          Add an email address on the <Link to={PATHS.ACCOUNT_PROFILE}>Profile</Link> page first. We
          send the link to set your password there.
        </p>
      ) : sent ? (
        <Alert variant="success" className="auth-card__alert mb-0" role="status">
          We sent a link to <strong>{user.email}</strong>. Open it to choose your password. It is
          valid for 1 hour.
        </Alert>
      ) : (
        <div className="account-card__actions">
          <Button variant="primary" onClick={handleSend} disabled={submitting}>
            {submitting ? "Sending..." : "Email me a link to set a password"}
          </Button>
        </div>
      )}
    </section>
  );
}

export default SetPasswordSection;
