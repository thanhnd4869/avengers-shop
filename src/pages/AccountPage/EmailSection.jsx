import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import PasswordField from "@components/PasswordField";
import useAuth from "@hooks/useAuth";
import { cancelEmailChange, requestEmailChange } from "@services/authService";
import { collectErrors, validateEmail } from "@utils/validation";

import { accountErrors } from "./accountErrors";

const EMPTY_FORM = { email: "", password: "" };

function EmailSection() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const found = collectErrors({
      email:
        validateEmail(form.email) ??
        (form.email.trim().toLowerCase() === user.email
          ? "This is already your email address."
          : undefined),
      password: form.password ? undefined : "Please enter your password.",
    });

    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);

    try {
      updateUser(await requestEmailChange({ email: form.email.trim(), password: form.password }));
      setForm(EMPTY_FORM);
    } catch (error) {
      const { fields, form: message } = accountErrors(error);

      setErrors(fields);
      setFormError(message);
    } finally {
      setSubmitting(false);
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
        We send a link to the new address. You keep signing in with <strong>{user.email}</strong>{" "}
        until it is confirmed.
      </p>

      {user.pendingEmail ? (
        <Alert variant="info" className="auth-card__alert" role="status">
          <div className="mb-2">
            Waiting for confirmation of <strong>{user.pendingEmail}</strong>. Open the link we sent
            there, or request it again below.
          </div>
          <Button variant="outline-light" size="sm" onClick={handleCancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel change"}
          </Button>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="danger" className="auth-card__alert" role="alert">
          {formError}
        </Alert>
      ) : null}

      <Form onSubmit={handleSubmit} noValidate className="d-grid gap-3">
        <Form.Group controlId="account-new-email">
          <Form.Label>New email</Form.Label>
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
