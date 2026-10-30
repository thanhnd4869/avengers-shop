import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate } from "react-router";

import Icon from "@components/Icon";
import useAuth from "@hooks/useAuth";
import { ACCOUNT_NAV_ITEMS } from "@routes/accountNav";
import { PATHS } from "@routes/paths";

import "./AccountMenu.css";

/**
 * The signed-in visitor's name in the header, opening a menu of account
 * pages with sign-out kept apart at the bottom, so it is never one stray
 * click away. `compact` shows only the avatar, for the mobile bar.
 */
function AccountMenu({ compact = false }) {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    // Signed out locally even if the server cannot be reached.
    await logout().catch(() => {});
    navigate(PATHS.HOME);
  };

  return (
    <Dropdown align="end" className="account-menu">
      <Dropdown.Toggle
        id={compact ? "account-menu-compact" : "account-menu"}
        className="account-menu__toggle"
        aria-label={`Account menu for ${user.displayName}`}
      >
        <span className="account-menu__avatar" aria-hidden="true">
          {user.displayName.trim().charAt(0).toUpperCase()}
        </span>
        {compact ? null : <span className="account-menu__name">{user.displayName}</span>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="account-menu__list">
        <Dropdown.Header className="account-menu__header">
          <span className="account-menu__header-name">{user.displayName}</span>
          {user.email ? <span className="account-menu__header-email">{user.email}</span> : null}
        </Dropdown.Header>
        <Dropdown.Divider />

        {ACCOUNT_NAV_ITEMS.map((item) => (
          <Dropdown.Item key={item.to} as={Link} to={item.to} className="account-menu__item">
            <Icon name={item.icon} size={14} />
            {item.label}
          </Dropdown.Item>
        ))}

        {isAdmin ? (
          <Dropdown.Item as={Link} to={PATHS.ADMIN} className="account-menu__item">
            <Icon name="gauge" size={14} />
            Admin
          </Dropdown.Item>
        ) : null}

        <Dropdown.Divider />
        <Dropdown.Item as="button" onClick={handleLogout} className="account-menu__item">
          <Icon name="logout" size={14} />
          Sign out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default AccountMenu;
