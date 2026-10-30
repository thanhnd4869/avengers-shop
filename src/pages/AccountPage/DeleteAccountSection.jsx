import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import PasswordField from "@components/PasswordField";
import useAuth from "@hooks/useAuth";

import { accountErrors } from "./accountErrors";
import ConfirmWithProvider from "./ConfirmWithProvider";

function DeleteAccountSection({ identities = [] }) {
  const { user, isAdmin, deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [needsReauth, setNeedsReauth] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = () => {
    setConfirming(false);
    setPassword("");
    setError("");
    setFormError("");
    setNeedsReauth(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setNeedsReauth(false);

    if (user.hasPassword && !password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    try {
      // Signs out on success, which unmounts this page.
      await deleteAccount({ password });
    } catch (requestError) {
      if (requestError.code === "REAUTH_REQUIRED") {
        setNeedsReauth(true);
      } else {
        const { fields, form } = accountErrors(requestError);

        setError(fields.password ?? "");
        setFormError(form);
      }

      setSubmitting(false);
    }
  };

  return (
    <section
      className="auth-card account-card account-card--danger rounded"
      aria-labelledby="account-delete-title"
    >
      <h2 id="account-delete-title" className="account-card__title">
        Delete account
      </h2>
      <p className="account-card__intro">
        Your account and sign-in details are removed for good. This cannot be undone.
      </p>

      {isAdmin ? (
        <p className="account-card__intro mb-0">
          Administrator accounts cannot be deleted from this page.
        </p>
      ) : null}

      {!isAdmin && !confirming ? (
        <Button variant="outline-danger" onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      ) : null}

      {!isAdmin && confirming ? (
        <Form onSubmit={handleSubmit} noValidate className="d-grid gap-3">
          {formError ? (
            <Alert variant="danger" className="auth-card__alert mb-0" role="alert">
              {formError}
            </Alert>
          ) : null}

          {needsReauth ? (
            <ConfirmWithProvider
              identities={identities}
              message="For your security, confirm it is you first. You will come back here to finish."
            />
          ) : null}

          {user.hasPassword ? (
            <PasswordField
              id="account-delete-password"
              label="Enter your password to confirm"
              name="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              autoComplete="current-password"
              error={error}
              autoFocus
              required
            />
          ) : null}

          <div className="d-flex flex-wrap gap-2">
            <Button type="submit" variant="danger" disabled={submitting}>
              {submitting ? "Deleting..." : "Delete permanently"}
            </Button>
            <Button variant="outline-light" onClick={handleCancel} disabled={submitting}>
              Keep my account
            </Button>
          </div>
        </Form>
      ) : null}
    </section>
  );
}

export default DeleteAccountSection;
