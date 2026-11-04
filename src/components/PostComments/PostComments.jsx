import { useCallback, useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Placeholder from "react-bootstrap/Placeholder";
import { Link, useLocation } from "react-router";

import SectionHeading from "@components/SectionHeading";
import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import { createComment, deleteComment, getComments, updateComment } from "@services/postService";
import { formatDate } from "@utils/format";

import "./PostComments.css";

const PAGE_SIZE = 20;
const MIN_LENGTH = 2;
const MAX_LENGTH = 2000;

function bodyError(text) {
  const length = text.trim().length;

  return length < MIN_LENGTH || length > MAX_LENGTH
    ? `Your comment must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`
    : "";
}

/** The text field shared by a new comment, a reply and an edit. */
function CommentForm({ id, label, initial = "", submitLabel, onSubmit, onCancel, autoFocus }) {
  const [text, setText] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const invalid = bodyError(text);

    setError(invalid);

    if (invalid) return;

    setSaving(true);

    try {
      await onSubmit(text.trim());
      setText("");
      setSaving(false);
    } catch (submitError) {
      setError(submitError.details?.[0]?.message ?? submitError.message);
      setSaving(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit} className="post-comments__form">
      <Form.Group controlId={id}>
        <Form.Label className={label ? "" : "visually-hidden"}>
          {label || "Your comment"}
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={label ? 5 : 3}
          maxLength={MAX_LENGTH}
          placeholder="Comment *"
          value={text}
          disabled={saving}
          isInvalid={Boolean(error)}
          autoFocus={autoFocus}
          onChange={(event) => setText(event.target.value)}
        />
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </Form.Group>
      <div className="post-comments__form-actions">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>
          {saving ? "Posting…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            variant="link"
            size="sm"
            className="post-comments__link"
            disabled={saving}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </Form>
  );
}

function Avatar({ name }) {
  return (
    <span className="post-comments__avatar" aria-hidden="true">
      {name ? name.trim().charAt(0).toUpperCase() : "?"}
    </span>
  );
}

/**
 * One comment. `reply` is the thread's open reply form, if it answers this
 * comment; editing happens in place.
 */
function Comment({ comment, signedIn, loginTo, onReply, onEdit, onDelete, children }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (comment.deleted) {
    return (
      <div className="post-comments__comment">
        <p className="post-comments__deleted">This comment was deleted.</p>
        {children}
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete your comment?")) return;

    setDeleting(true);

    try {
      await onDelete(comment);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="post-comments__comment" id={`comment-${comment.id}`}>
      <div className="post-comments__meta">
        <Avatar name={comment.authorName} />
        <span>
          by <strong className="post-comments__author">{comment.authorName}</strong> in{" "}
          <time dateTime={comment.createdAt}>{formatDate(comment.createdAt, "en-US")}</time>
          {comment.edited ? <span className="post-comments__edited"> (edited)</span> : null}
        </span>
        {signedIn ? (
          <button type="button" className="post-comments__reply" onClick={() => onReply(comment)}>
            Reply
          </button>
        ) : (
          <Link to={loginTo} className="post-comments__reply">
            Reply
          </Link>
        )}
      </div>
      {editing ? (
        <CommentForm
          id={`edit-${comment.id}`}
          initial={comment.body}
          submitLabel="Save"
          autoFocus
          onCancel={() => setEditing(false)}
          onSubmit={async (body) => {
            await onEdit(comment, body);
            setEditing(false);
          }}
        />
      ) : (
        <p className="post-comments__text">{comment.body}</p>
      )}
      {comment.mine && !editing ? (
        <div className="post-comments__own">
          <button
            type="button"
            className="post-comments__link"
            disabled={deleting}
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button
            type="button"
            className="post-comments__link"
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Pages of threads merged in order, a thread fetched twice kept once. */
function mergeThreads(pages) {
  const seen = new Set();

  return pages.flatMap((page) =>
    page.data.filter((thread) => !seen.has(thread.id) && seen.add(thread.id)),
  );
}

/**
 * The comments under a blog post, as on the reference: each thread with its
 * replies indented beneath it, then "Leave a Reply". Signed-in readers may
 * comment, reply, and edit or delete what they wrote. After any change the
 * pages already shown are fetched again, so the list matches the server even
 * when someone else commented meanwhile.
 *
 * `onCountChange(count)` reports the post's comment count after each load.
 */
function PostComments({ slug, onCountChange }) {
  const location = useLocation();
  const { status: authStatus, user } = useAuth();
  const signedIn = authStatus === "authenticated";
  const loginTo = `${PATHS.LOGIN}?redirect=${encodeURIComponent(location.pathname)}`;
  const [pages, setPages] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notice, setNotice] = useState("");
  // The comment being answered; its thread shows the reply form.
  const [replyTo, setReplyTo] = useState(null);

  const applyPages = useCallback(
    (next) => {
      setPages(next);
      setLoadError(null);
      onCountChange?.(next.at(-1).meta.commentCount);
    },
    [onCountChange],
  );

  const reload = useCallback(
    async (pageCount) => {
      const count = Math.max(pageCount, 1);
      const next = await Promise.all(
        Array.from({ length: count }, (_, index) =>
          getComments(slug, { page: index + 1, limit: PAGE_SIZE }),
        ),
      );

      applyPages(next);
    },
    [slug, applyPages],
  );

  // The signed-in state changes which comments are "mine".
  useEffect(() => {
    let cancelled = false;

    getComments(slug, { page: 1, limit: PAGE_SIZE })
      .then((first) => !cancelled && applyPages([first]))
      .catch((error) => !cancelled && setLoadError(error));

    return () => {
      cancelled = true;
    };
  }, [slug, signedIn, applyPages]);

  const refresh = () => reload(pages?.length ?? 1).catch(() => {});

  const loadMore = async () => {
    setLoadingMore(true);

    try {
      const next = await getComments(slug, { page: pages.length + 1, limit: PAGE_SIZE });

      applyPages([...pages, next]);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const post = async (body, parentId = null) => {
    try {
      await createComment(slug, { body, parentId });
    } catch (error) {
      // Answered a comment that was deleted meanwhile.
      if (error.status === 404 && parentId) {
        setReplyTo(null);
        setNotice(error.message);
        await refresh();
        return;
      }

      throw error;
    }

    setNotice("");
    setReplyTo(null);

    const lastPage = pages?.at(-1)?.meta;
    const onLastPage = !lastPage || lastPage.page >= lastPage.totalPages;

    // A new thread lands at the end; show it if the end is already shown.
    await reload((pages?.length ?? 1) + (onLastPage && !parentId ? 1 : 0));
  };

  const edit = async (comment, body) => {
    await updateComment(slug, comment.id, { body });
    await refresh();
  };

  const remove = async (comment) => {
    try {
      await deleteComment(slug, comment.id);
      setNotice("");
    } catch (error) {
      setNotice(error.message);
    }

    await refresh();
  };

  const threads = pages ? mergeThreads(pages) : [];
  const meta = pages?.at(-1)?.meta;
  const commentCount = meta?.commentCount ?? 0;
  const hasMore = meta ? meta.page < meta.totalPages : false;

  const replyForm = (thread) => {
    const target =
      replyTo && [thread, ...thread.replies].find((comment) => comment.id === replyTo.id);

    if (!target) return null;

    return (
      <div className="post-comments__reply-form">
        <p className="post-comments__replying">
          Replying to <strong>{target.authorName}</strong>
        </p>
        <CommentForm
          id={`reply-${thread.id}`}
          submitLabel="Post Reply"
          autoFocus
          onCancel={() => setReplyTo(null)}
          onSubmit={(body) => post(body, target.id)}
        />
      </div>
    );
  };

  const commentProps = {
    signedIn,
    loginTo,
    onReply: setReplyTo,
    onEdit: edit,
    onDelete: remove,
  };

  return (
    <section className="post-comments" aria-labelledby="post-comments-title">
      <SectionHeading highlight={pages ? commentCount : ""} className="mb-4">
        <span id="post-comments-title">{commentCount === 1 ? "Comment" : "Comments"}</span>
      </SectionHeading>

      {notice ? (
        <Alert variant="warning" dismissible onClose={() => setNotice("")}>
          {notice}
        </Alert>
      ) : null}

      {!pages && !loadError ? (
        <Placeholder as="div" animation="glow">
          <Placeholder xs={4} />
          <Placeholder xs={12} />
          <Placeholder xs={10} />
        </Placeholder>
      ) : loadError && !pages ? (
        <p className="post-comments__empty rounded" role="alert">
          We could not load the comments. Please try again later.
        </p>
      ) : threads.length ? (
        <ol className="post-comments__list">
          {threads.map((thread) => (
            <li key={thread.id}>
              <Comment comment={thread} {...commentProps}>
                {thread.replies.length ? (
                  <ol className="post-comments__replies">
                    {thread.replies.map((reply) => (
                      <li key={reply.id}>
                        <Comment comment={reply} {...commentProps} />
                      </li>
                    ))}
                  </ol>
                ) : null}
                {replyForm(thread)}
              </Comment>
            </li>
          ))}
        </ol>
      ) : (
        <p className="post-comments__empty rounded">No comments yet. Be the first!</p>
      )}

      {hasMore ? (
        <div className="text-center mt-4">
          <Button variant="secondary" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? "Loading…" : "Load more comments"}
          </Button>
        </div>
      ) : null}

      <div className="post-comments__respond">
        <SectionHeading highlight="Leave" className="mb-3">
          a Reply
        </SectionHeading>
        {authStatus === "loading" ? null : signedIn ? (
          <>
            <p className="post-comments__as">
              Commenting as <strong>{user.displayName}</strong>.
            </p>
            <CommentForm
              id="new-comment"
              label="Comment"
              submitLabel="Post Comment"
              onSubmit={(body) => post(body)}
            />
          </>
        ) : (
          <p className="post-comments__empty rounded">
            <Link to={loginTo}>Sign in</Link> to leave a comment.
          </p>
        )}
      </div>
    </section>
  );
}

export default PostComments;
