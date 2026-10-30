import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, useNavigate, useSearchParams } from "react-router";

import AuthLayout from "@components/AuthLayout";
import PasswordField from "@components/PasswordField";
import SocialSignIn from "@components/SocialSignIn";
import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import {
  apiFieldErrors,
  apiFormError,
  collectErrors,
  PASSWORD_HINT,
  safeRedirect,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "@utils/validation";

const EMPTY_FORM = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function validate(form) {
  return collectErrors({
    displayName: validateDisplayName(form.displayName),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: form.confirmPassword === form.password ? undefined : "Passwords do not match.",
    acceptTerms: form.acceptTerms ? undefined : "Please accept the terms to continue.",
  });
}

export function Component() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"), PATHS.HOME);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;

    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const found = validate(form);

    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);

    try {
      await register({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const byField = apiFieldErrors(error);

      setErrors(byField);
      // A taken email comes back as an `email` field error, so it is only
      // shown above the form when the API did not name the field.
      setFormError(
        Object.keys(byField).length
          ? ""
          : error.status === 409
            ? "An account with this email already exists."
            : apiFormError(error),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const loginTo =
    redirectTo === PATHS.HOME
      ? PATHS.LOGIN
      : `${PATHS.LOGIN}?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthLayout
      highlight="Create"
      title="account"
      subtitle="It takes a minute, and your keys stay with you for good."
      error={formError}
      footer={
        <>
          Already have an account? <Link to={loginTo}>Sign in</Link>
        </>
      }
    >
      <Form onSubmit={handleSubmit} noValidate className="d-grid gap-3">
        <Form.Group controlId="register-name">
          <Form.Label>Display name</Form.Label>
          <Form.Control
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            autoComplete="nickname"
            placeholder="Your gamer tag"
            className="auth-input"
            isInvalid={Boolean(errors.displayName)}
            autoFocus
            required
          />
          <Form.Control.Feedback type="invalid">{errors.displayName}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="register-email">
          <Form.Label>Email</Form.Label>
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
          id="register-password"
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.password}
          hint={PASSWORD_HINT}
          required
        />

        <PasswordField
          id="register-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
        />

        <Form.Group controlId="register-terms">
          <Form.Check
            name="acceptTerms"
            checked={form.acceptTerms}
            onChange={handleChange}
            isInvalid={Boolean(errors.acceptTerms)}
            feedback={errors.acceptTerms}
            feedbackType="invalid"
            label={
              <>
                I agree to the{" "}
                <Link to={PATHS.TERMS} className="auth-link">
                  Terms of service
                </Link>{" "}
                and{" "}
                <Link to={PATHS.PRIVACY} className="auth-link">
                  Privacy policy
                </Link>
              </>
            }
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={submitting} className="mt-2">
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </Form>

      <SocialSignIn redirect={redirectTo} label="Sign up with" />
    </AuthLayout>
  );
}

Component.displayName = "RegisterPage";
