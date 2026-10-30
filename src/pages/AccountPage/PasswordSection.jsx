import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import PasswordField from "@components/PasswordField";
import useAuth from "@hooks/useAuth";
import { collectErrors, PASSWORD_HINT, validatePassword } from "@utils/validation";

import { accountErrors } from "./accountErrors";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordSection() {
  const { changePassword } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaved(false);

    const found = collectErrors({
      currentPassword: form.currentPassword ? undefined : "Please enter your current password.",
      newPassword:
        validatePassword(form.newPassword) ??
        (form.newPassword === form.currentPassword
          ? "The new password must differ from the current one."
          : undefined),
      confirmPassword:
        form.confirmPassword === form.newPassword ? undefined : "Passwords do not match.",
    });

    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(EMPTY_FORM);
      setSaved(true);
    } catch (error) {
      const { fields, form: message } = accountErrors(error);

      setErrors(fields);
      setFormError(message);
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
        You stay signed in here. Every other device is signed out.
      </p>

      {formError ? (
        <Alert variant="danger" className="auth-card__alert" role="alert">
          {formError}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" className="auth-card__alert" role="status">
          Your password was changed. Other devices were signed out.
        </Alert>
      ) : null}

      <Form onSubmit={handleSubmit} noValidate className="d-grid gap-3">
        <PasswordField
          id="account-current-password"
          label="Current password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          autoComplete="current-password"
          error={errors.currentPassword}
          required
        />

        <PasswordField
          id="account-new-password"
          label="New password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.newPassword}
          hint={PASSWORD_HINT}
          required
        />

        <PasswordField
          id="account-confirm-password"
          label="Confirm new password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />

        <div className="account-card__actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving..." : "Change password"}
          </Button>
        </div>
      </Form>
    </section>
  );
}

export default PasswordSection;
