import { useState } from "react";
import Container from "react-bootstrap/Container";
import { Link, useLocation } from "react-router";

import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import { resendEmailChange, resendVerificationEmail } from "@services/authService";

import "./VerifyEmailBanner.css";

/**
 * Reminds a signed-in visitor to confirm their email, with a way to get the
 * link again. Hidden once the address is verified. An account from Facebook
 * may have no address yet, or one waiting to be confirmed; the banner then
 * asks for that instead.
 */
function VerifyEmailBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!user || (user.email && user.emailVerifiedAt)) return null;

  // Only an address that is not on the account yet waits as `pendingEmail`.
  const address = user.email ?? user.pendingEmail;

  if (!address) {
    // On the profile page the form to add one is right below.
    if (location.pathname === PATHS.ACCOUNT_PROFILE) return null;

    return (
      <div className="verify-banner" role="status">
        <Container className="d-flex flex-wrap align-items-center justify-content-center gap-2 gap-md-3">
          <span className="verify-banner__text">
            Add an email address to receive your keys and receipts.
          </span>
          <Link to={PATHS.ACCOUNT_PROFILE} className="verify-banner__action">
            Add email
          </Link>
        </Container>
      </div>
    );
  }

  const handleResend = async () => {
    setSending(true);
    setMessage("");

    try {
      await (user.email ? resendVerificationEmail() : resendEmailChange());
      // The address is already on the banner, so it is not repeated here.
      setMessage("A new link is on its way.");
    } catch (error) {
      setMessage(
        error.status === 429
          ? error.message
          : "We could not send the email. Please try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verify-banner" role="status">
      <Container className="d-flex flex-wrap align-items-center justify-content-center gap-2 gap-md-3">
        <span className="verify-banner__text">
          Please verify your email address
          <strong className="verify-banner__email" title={address}>
            {address}
          </strong>
          .
        </span>
        <button
          type="button"
          className="verify-banner__action"
          onClick={handleResend}
          disabled={sending}
        >
          {sending ? "Sending..." : "Resend email"}
        </button>
        {message ? <span className="verify-banner__message">{message}</span> : null}
      </Container>
    </div>
  );
}

export default VerifyEmailBanner;
