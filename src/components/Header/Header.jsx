import { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, NavLink, useLocation } from "react-router";

import AccountMenu from "@components/AccountMenu";
import HeaderSearch from "@components/HeaderSearch";
import Icon from "@components/Icon";
import MiniCart from "@components/MiniCart";
import { APP_NAME } from "@constants/app";
import useAsync from "@hooks/useAsync";
import useAuth from "@hooks/useAuth";
import { PATHS } from "@routes/paths";
import { getSocialLinks } from "@services/socialLinkService";

import "./Header.css";

const NAV_ITEMS = [
  { label: "Home", to: PATHS.HOME, end: true },
  { label: "Shop", to: PATHS.SHOP },
  { label: "Blog", to: PATHS.BLOG },
  { label: "Gallery", to: PATHS.GALLERY },
];

function Header() {
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  // Brings the visitor back to the page they were on once signed in.
  const isAuthPage = [PATHS.LOGIN, PATHS.REGISTER].includes(location.pathname);
  const loginTo = isAuthPage
    ? PATHS.LOGIN
    : `${PATHS.LOGIN}?redirect=${encodeURIComponent(location.pathname + location.search)}`;
  const socials = useAsync(() => getSocialLinks(), []);
  const socialLinks = socials.error ? [] : (socials.data?.data ?? []);

  const accountControl = (compact) =>
    user ? (
      <AccountMenu compact={compact} />
    ) : (
      <Link to={loginTo} className="header__icon-button" aria-label="Sign in" title="Sign in">
        <Icon name="login" />
      </Link>
    );

  // Each bar gets its own menu id; only one of them is visible at a time.
  const cartLink = (compact) => <MiniCart id={compact ? "mini-cart-compact" : "mini-cart"} />;

  return (
    <header className="header">
      <div className="header__topbar d-none d-lg-block">
        <Container className="d-flex align-items-center justify-content-between">
          <ul className="header__social list-unstyled d-flex gap-3 mb-0">
            {socialLinks.map((social) => (
              <li key={social.id}>
                <a
                  href={social.url}
                  aria-label={social.label}
                  className="sf-link-muted"
                  data-social={social.network}
                >
                  <Icon name={social.network} />
                </a>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-4">
            <HeaderSearch />
            {accountControl(false)}
            {cartLink(false)}
          </div>
        </Container>
      </div>

      <Navbar
        expand="lg"
        expanded={expanded}
        onToggle={setExpanded}
        className="header__navbar"
        collapseOnSelect
      >
        <Container>
          <Navbar.Brand as={Link} to={PATHS.HOME} className="header__brand">
            <img src="/assets/squadforce/logo.svg" alt={APP_NAME} />
          </Navbar.Brand>
          {/* The top bar is hidden below lg, so the account and the cart move
              next to the menu button there instead of disappearing. */}
          <div className="header__mobile-actions d-flex d-lg-none align-items-center gap-2 ms-auto">
            <HeaderSearch />
            {accountControl(true)}
            {cartLink(true)}
            <Navbar.Toggle aria-controls="main-navigation" className="header__toggle ms-1" />
          </div>
          <Navbar.Collapse id="main-navigation">
            <Nav className="ms-auto align-items-lg-center gap-lg-1">
              {NAV_ITEMS.map((item) => (
                <Nav.Link
                  key={item.to}
                  as={NavLink}
                  to={item.to}
                  end={item.end}
                  className="header__link"
                  onClick={() => setExpanded(false)}
                >
                  {item.label}
                </Nav.Link>
              ))}
              <Link
                to={PATHS.SHOP}
                className="btn btn-primary ms-lg-3 mt-3 mt-lg-0"
                onClick={() => setExpanded(false)}
              >
                Buy Now
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
