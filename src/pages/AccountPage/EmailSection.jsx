import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import PasswordField from "@components/PasswordField";
import useAuth from "@hooks/useAuth";
import { cancelEmailChange, requestEmailChange, resendEmailChange } from "@services/authService";
import { collectErrors, validateEmail } from "@utils/validation";

import { accountErrors } from "./accountErrors";
import ConfirmWithProvider from "./ConfirmWithProvider";

const EMPTY_FORM = { email: "", password: "" };

function EmailSection({ identities = [] }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [needsReauth, setNeedsReauth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [resent, setResent] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setNeedsReauth(false);
    setResent(false);

    const found = collectErrors({
      email:
        validateEmail(form.email) ??
        (form.email.trim().toLowerCase() === user.email
          ? "This is already your email address."
          : undefined),
      // An account without a password confirms with Google or Facebook.
      password: !user.hasPassword || form.password ? undefined : "Please enter your password.",
    });

    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);

    try {
      updateUser(await requestEmailChange({ email: form.email.trim(), password: form.password }));
      setForm(EMPTY_FORM);
    } catch (error) {
      if (error.code === "REAUTH_REQUIRED") {
        setNeedsReauth(true);
        return;
      }

      const { fields, form: message } = accountErrors(error);

      setErrors(fields);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setFormError("");
    setResent(false);

    try {
      updateUser(await resendEmailChange());
      setResent(true);
    } catch (error) {
      setFormError(accountErrors(error).form);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setFormError("");

    try {
      updateUser(await cancelEmailChange());
    } catch (error) {
      setFormError(accountErrors(error).form);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className="auth-card account-card rounded" aria-labelledby="account-email-title">
      <h2 id="account-email-title" className="account-card__title">
        Email address
      </h2>
      <p className="account-card__intro">
        {user.email ? (
          <>
            We send a link to the new address. You keep using <strong>{user.email}</strong> until it
            is confirmed.
          </>
        ) : (
          "Your account has no email address yet. Add one to receive your keys, receipts and a way to reset your password."
        )}
      </p>

      {user.pendingEmail ? (
        <Alert variant="info" className="auth-card__alert" role="status">
          <div className="mb-2">
            Waiting for confirmation of <strong>{user.pendingEmail}</strong>. Open the link we sent
            there.
          </div>
          {resent ? <div className="mb-2">A new link is on its way.</div> : null}
          <div className="d-flex flex-wrap gap-2">
            <Button variant="outline-light" size="sm" onClick={handleResend}>
              Send the link again
            </Button>
            <Button variant="outline-light" size="sm" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : "Cancel change"}
            </Button>
          </div>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="danger" className="auth-card__alert" role="alert">
          {formError}
        </Alert>
      ) : null}

      {needsReauth ? (
        <div className="mb-3">
          <ConfirmWithProvider
            identities={identities}
            message="For your security, confirm it is you before changing your email address. You will come back here."
          />
        </div>
      ) : null}

      <Form onSubmit={handleSubmit} noValidate className="d-grid gap-3">
        <Form.Group controlId="account-new-email">
          <Form.Label>{user.email ? "New email" : "Email"}</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="you@example.com"
            className="auth-input"
            isInvalid={Boolean(errors.email)}
            required
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        {user.hasPassword ? (
          <PasswordField
            id="account-email-password"
            label="Current password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            error={errors.password}
            required
          />
        ) : null}

        <div className="account-card__actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Sending..." : "Send confirmation link"}
          </Button>
        </div>
      </Form>
    </section>
  );
}

export default EmailSection;
