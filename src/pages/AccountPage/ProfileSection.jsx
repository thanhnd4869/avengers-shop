import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import useAuth from "@hooks/useAuth";
import { updateProfile } from "@services/authService";
import { validateDisplayName } from "@utils/validation";

import { accountErrors } from "./accountErrors";

function ProfileSection() {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaved(false);

    const found = validateDisplayName(displayName);

    setError(found ?? "");
    if (found) return;

    setSubmitting(true);

    try {
      const updated = await updateProfile({ displayName: displayName.trim() });

      updateUser(updated);
      setDisplayName(updated.displayName);
      setSaved(true);
    } catch (requestError) {
      const { fields, form } = accountErrors(requestError);

      setError(fields.displayName ?? "");
      setFormError(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-card account-card rounded" aria-labelledby="account-profile-title">
      <h2 id="account-profile-title" className="account-card__title">
        Profile
      </h2>
      <p className="account-card__intro">The name shown in the header while you are signed in.</p>

      {formError ? (
        <Alert variant="danger" className="auth-card__alert" role="alert">
          {formError}
        </Alert>
      ) : null}
      {saved ? (
        <Alert variant="success" className="auth-card__alert" role="status">
          Your display name was saved.
        </Alert>
      ) : null}

      <Form onSubmit={handleSubmit} noValidate className="d-grid gap-3">
        <Form.Group controlId="account-display-name">
          <Form.Label>Display name</Form.Label>
          <Form.Control
            name="displayName"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setError("");
              setSaved(false);
            }}
            autoComplete="nickname"
            className="auth-input"
            isInvalid={Boolean(error)}
            required
          />
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </Form.Group>

        <div className="account-card__actions">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || displayName.trim() === user.displayName}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </Form>
    </section>
  );
}

export default ProfileSection;
