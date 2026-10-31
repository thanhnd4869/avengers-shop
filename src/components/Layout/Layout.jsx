import { Outlet, ScrollRestoration } from "react-router";

import Footer from "@components/Footer";
import Header from "@components/Header";
import VerifyEmailBanner from "@components/VerifyEmailBanner";

function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
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
