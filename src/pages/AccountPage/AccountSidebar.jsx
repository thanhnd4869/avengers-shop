import Badge from "react-bootstrap/Badge";
import { NavLink, useNavigate } from "react-router";

import Icon from "@components/Icon";
import useAuth from "@hooks/useAuth";
import { ACCOUNT_NAV_ITEMS } from "@routes/accountNav";
import { PATHS } from "@routes/paths";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value));
}

/**
 * Who is signed in, at a glance, and the menu of account sub-pages. Sits
 * beside the page on wide screens and above it, as a row of tabs, on narrow
 * ones.
 */
function AccountSidebar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout().catch(() => {});
    navigate(PATHS.HOME);
  };

  return (
    <div className="account-sidebar">
      <div className="account-sidebar__summary">
        <div className="account-sidebar__identity">
          <span className="account-sidebar__avatar" aria-hidden="true">
            {user.displayName.trim().charAt(0).toUpperCase()}
          </span>
          <div className="account-sidebar__name-block">
            <p className="account-sidebar__name">{user.displayName}</p>
            <p className="account-sidebar__email" title={user.email ?? ""}>
              {user.email ?? "No email address yet"}
            </p>
          </div>
        </div>

        <div className="account-sidebar__badges">
          {!user.email ? (
            <Badge bg="danger">No email</Badge>
          ) : user.emailVerifiedAt ? (
            <Badge bg="success">Email verified</Badge>
          ) : (
            <Badge bg="danger">Email not verified</Badge>
          )}
          {isAdmin ? <Badge bg="secondary">Administrator</Badge> : null}
        </div>

        <p className="account-sidebar__since">Member since {formatDate(user.createdAt)}</p>
      </div>

      <nav className="account-sidebar__nav" aria-label="Account">
        <ul className="list-unstyled mb-0">
          {ACCOUNT_NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className="account-sidebar__link">
                <Icon name={item.icon} size={14} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="account-sidebar__logout" onClick={handleLogout}>
        <Icon name="logout" size={14} />
        Sign out
      </button>
    </div>
  );
}

export default AccountSidebar;
