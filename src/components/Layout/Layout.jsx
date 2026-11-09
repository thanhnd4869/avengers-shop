import { Outlet, ScrollRestoration, useMatches } from "react-router";

import Footer from "@components/Footer";
import Header from "@components/Header";
import Seo from "@components/Seo";
import VerifyEmailBanner from "@components/VerifyEmailBanner";

function Layout() {
  // Private pages (cart, checkout, account, sign-in) set `handle` on their
  // route. Public pages render their own <Seo> deeper in the tree; React runs
  // its effect after this one, so the page's tags win.
  const handle = [...useMatches()].reverse().find((match) => match.handle)?.handle;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Seo title={handle?.title} noIndex={handle?.noIndex} />
      <Header />
      <VerifyEmailBanner />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
      {/* A new page opens at the top and the back button returns to where the
          visitor was. Links that only change filters opt out with
          `preventScrollReset`. */}
      <ScrollRestoration />
    </div>
  );
}

export default Layout;
