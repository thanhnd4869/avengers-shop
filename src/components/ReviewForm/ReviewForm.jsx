import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Placeholder from "react-bootstrap/Placeholder";
import { Link, useLocation } from "react-router";

import StarInput from "@components/StarInput";
import StarRating from "@components/StarRating";
import useAsync from "@hooks/useAsync";
import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import {
  createReview,
  deleteMyReview,
  getMyReview,
  updateMyReview,
} from "@services/productService";
import { formatDate } from "@utils/format";

import "./ReviewForm.css";

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

function fieldErrors(error) {
  return Object.fromEntries((error?.details ?? []).map((item) => [item.field, item.message]));
}

/** The rating and text fields, for a new review or an edit. */
function Editor({ initial, submitLabel, onSubmit, onCancel }) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [content, setContent] = useState(initial?.content ?? "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const length = content.trim().length;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const next = {};

    if (!rating) next.rating = "Choose a rating from 1 to 5 stars.";
    if (length < MIN_LENGTH || length > MAX_LENGTH) {
      next.content = `Your review must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`;
    }

    setErrors(next);
    setFormError("");

    if (Object.keys(next).length) return;

    setSaving(true);

    try {
      await onSubmit({ rating, content: content.trim() });
    } catch (error) {
      const fields = fieldErrors(error);

      setErrors(fields);
      if (!Object.keys(fields).length) setFormError(error.message);
      setSaving(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit} className="review-form__editor">
      {formError ? (
        <Alert variant="danger" className="mb-0">
          {formError}
        </Alert>
      ) : null}

      <div>
        <StarInput
          value={rating}
          onChange={setRating}
          disabled={saving}
          invalid={Boolean(errors.rating)}
        />
        {errors.rating ? <p className="review-form__error">{errors.rating}</p> : null}
      </div>

      <Form.Group controlId="review-content">
        <Form.Label>Your review</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          maxLength={MAX_LENGTH}
          value={content}
          disabled={saving}
          isInvalid={Boolean(errors.content)}
          placeholder="What did you like or dislike? How does it play?"
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="review-form__hint">
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.content}
          </Form.Control.Feedback>
          <span>
            {length}/{MAX_LENGTH}
          </span>
        </div>
      </Form.Group>

      <div className="review-form__actions">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="link" className="review-form__link" disabled={saving} onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </Form>
  );
}

/**
 * The reader's part of the reviews tab: a prompt to sign in, a note that only
 * buyers may review, the form, or their own review with edit and delete.
 * `onChanged` lets the page reload the list and the rating after a change.
 */
function ReviewForm({ slug, onChanged }) {
  const location = useLocation();
  const { status: authStatus } = useAuth();
  const signedIn = authStatus === "authenticated";
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState(false);
  const mine = useAsync(
    () => (signedIn ? getMyReview(slug) : Promise.resolve(null)),
    [slug, signedIn, version],
  );

  const changed = (message) => {
    setNotice(message);
    setEditing(false);
    setVersion((current) => current + 1);
    onChanged();
  };

  if (authStatus === "loading" || (signedIn && mine.isLoading)) {
    return (
      <Placeholder as="div" animation="glow" className="review-form">
        <Placeholder xs={5} />
      </Placeholder>
    );
  }

  if (!signedIn) {
    const loginTo = `${PATHS.LOGIN}?redirect=${encodeURIComponent(location.pathname)}`;

    return (
      <div className="review-form review-form--note">
        <Link to={loginTo}>Sign in</Link> to review a game you bought.
      </div>
    );
  }

  if (mine.error) {
    return (
      <div className="review-form review-form--note" role="alert">
        We could not check whether you can review this game.
      </div>
    );
  }

  const { canReview, purchased, review } = mine.data.data;

  if (review && !editing) {
    const handleDelete = async () => {
      if (!window.confirm("Delete your review?")) return;

      setDeleting(true);

      try {
        await deleteMyReview(slug);
        changed("Your review was deleted.");
      } catch (error) {
        setNotice(error.message);
      } finally {
        setDeleting(false);
      }
    };

    return (
      <section className="review-form" aria-label="Your review">
        {notice ? (
          <p className="review-form__notice" role="status">
            {notice}
          </p>
        ) : null}
        <div className="review-form__mine">
          <div className="review-form__mine-head">
            <h3 className="review-form__title">Your review</h3>
            <StarRating value={review.rating} size={13} />
          </div>
          <p className="review-form__meta">
            {review.updatedAt !== review.createdAt ? "Edited" : "Posted"} on{" "}
            {formatDate(review.updatedAt)}
          </p>
          <p className="review-form__content">{review.content}</p>
          <div className="review-form__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={deleting}
            >
              Edit
            </Button>
            <Button
              variant="link"
              size="sm"
              className="review-form__link"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (review && editing) {
    return (
      <section className="review-form" aria-label="Edit your review">
        <h3 className="review-form__title">Edit your review</h3>
        <Editor
          initial={review}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await updateMyReview(slug, values);
            changed("Your review was updated.");
          }}
        />
      </section>
    );
  }

  if (!canReview) {
    return (
      <div className="review-form review-form--note">
        {notice ? (
          <p className="review-form__notice mb-2" role="status">
            {notice}
          </p>
        ) : null}
        {purchased
          ? "You have already reviewed this game."
          : "Only customers who bought this game can review it."}
      </div>
    );
  }

  return (
    <section className="review-form" aria-label="Write a review">
      {notice ? (
        <p className="review-form__notice" role="status">
          {notice}
        </p>
      ) : null}
      <h3 className="review-form__title">Write a review</h3>
      <p className="review-form__meta">
        You bought this game, so your review shows as a verified purchase.
      </p>
      <Editor
        submitLabel="Post review"
        onSubmit={async (values) => {
          try {
            await createReview(slug, values);
            changed("Thanks! Your review is posted.");
          } catch (error) {
            // Posted from another tab a moment ago: show that review.
            if (error.code === "REVIEW_EXISTS") {
              changed("You had already reviewed this game.");
              return;
            }

            throw error;
          }
        }}
      />
    </section>
  );
}

export default ReviewForm;
