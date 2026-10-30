import Alert from "react-bootstrap/Alert";
import { Outlet, useLocation, useNavigate } from "react-router";

import AccountSidebar from "./AccountSidebar";

// The cards reuse the sign-in form styles (inputs, password toggle, alerts),
// which live with the auth layout.
import "@components/AuthLayout/AuthLayout.css";
import "./AccountPage.css";

/**
 * Shell of the account area: the summary and section menu on the left, and
 * the current sub-page (profile, security, and later orders or the wishlist)
 * on the right.
 */
export function Component() {
  const location = useLocation();
  const navigate = useNavigate();
  // Set by the Google/Facebook callback, e.g. "Google is now connected".
  const notice = location.state?.notice;

  const dismissNotice = () =>
    navigate(location.pathname + location.search, { replace: true, state: null });

  return (
    <section className="account-page container">
      <h1 className="account-page__title">
        <span className="text-primary">My</span> account
      </h1>

      {notice ? (
        <Alert variant="success" dismissible onClose={dismissNotice} role="status">
          {notice}
        </Alert>
      ) : null}

      <div className="account-page__layout">
        <aside className="account-page__aside">
          <AccountSidebar />
        </aside>

        <div className="account-page__content">
          <Outlet />
        </div>
      </div>
    </section>
  );
}

Component.displayName = "AccountPage";
