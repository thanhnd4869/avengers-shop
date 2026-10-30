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
  safeRedirect,
  validateEmail,
} from "@utils/validation";

const EMPTY_FORM = { email: "", password: "", remember: false };

export function Component() {
  const navigate = useNavigate();
  const { login, notice } = useAuth();
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

    // Sign-in only checks that something was entered: telling the visitor the
    // password rules here would hint at which accounts exist.
    const found = collectErrors({
      email: validateEmail(form.email),
      password: form.password ? undefined : "Please enter your password.",
    });

    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);

    try {
      await login({ ...form, email: form.email.trim() });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const byField = apiFieldErrors(error);

      setErrors(byField);
      setFormError(
        error.status === 401
          ? "The email or password is incorrect."
          : Object.keys(byField).length
            ? ""
            : apiFormError(error),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const registerTo =
    redirectTo === PATHS.HOME
      ? PATHS.REGISTER
      : `${PATHS.REGISTER}?redirect=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthLayout
      highlight="Sign"
      title="in"
      subtitle="Welcome back. Sign in to see your keys and orders."
      error={formError || notice}
      footer={
        <>
          New here? <Link to={registerTo}>Create an account</Link>
        </>
      }
    >
      <Form onSubmit={handleSubmit} noValidate className="d-grid gap-3">
        <Form.Group controlId="login-email">
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
            autoFocus
            required
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>

        <PasswordField
          id="login-password"
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          error={errors.password}
          required
        />

        <div className="d-flex align-items-center justify-content-between gap-3">
          <Form.Check
            id="login-remember"
            name="remember"
            label="Remember me"
            checked={form.remember}
            onChange={handleChange}
          />
          <Link to={PATHS.FORGOT_PASSWORD} className="auth-link small">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" disabled={submitting} className="mt-2">
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </Form>

      <SocialSignIn remember={form.remember} redirect={redirectTo} />
    </AuthLayout>
  );
}

Component.displayName = "LoginPage";
