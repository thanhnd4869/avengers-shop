import { createBrowserRouter, Navigate } from "react-router";

import { GuestOnly, RequireAuth } from "@components/AuthGuard";
import Layout from "@components/Layout";
import PageLoader from "@components/PageLoader";

import { PATHS } from "./paths";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    HydrateFallback: PageLoader,
    children: [
      {
        path: PATHS.HOME,
        lazy: () => import("@pages/HomePage"),
      },
      {
        path: PATHS.SHOP,
        lazy: () => import("@pages/ShopPage"),
      },
      {
        path: PATHS.PRODUCT,
        lazy: () => import("@pages/ProductPage"),
      },
      {
        path: PATHS.CART,
        handle: { title: "Cart", noIndex: true },
        lazy: () => import("@pages/CartPage"),
      },
      {
        path: PATHS.BLOG,
        lazy: () => import("@pages/BlogPage"),
      },
      {
        path: PATHS.POST,
        lazy: () => import("@pages/PostPage"),
      },
      {
        path: PATHS.GALLERY,
        lazy: () => import("@pages/GalleryPage"),
      },
      {
        path: PATHS.SEARCH,
        lazy: () => import("@pages/SearchPage"),
      },
      // One page component for the help centre and the policies; it reads
      // the route to know which page to load.
      ...[PATHS.FAQ, PATHS.REFUND_POLICY, PATHS.TERMS, PATHS.PRIVACY].map((path) => ({
        path,
        lazy: () => import("@pages/ContentPage"),
      })),
      {
        element: <GuestOnly />,
        children: [
          {
            path: PATHS.LOGIN,
            handle: { title: "Sign in", noIndex: true },
            lazy: () => import("@pages/LoginPage"),
          },
          {
            path: PATHS.REGISTER,
            handle: { title: "Create account", noIndex: true },
            lazy: () => import("@pages/RegisterPage"),
          },
          {
            path: PATHS.FORGOT_PASSWORD,
            handle: { title: "Forgot password", noIndex: true },
            lazy: () => import("@pages/ForgotPasswordPage"),
          },
        ],
      },
      {
        path: PATHS.RESET_PASSWORD,
        handle: { title: "Reset password", noIndex: true },
        lazy: () => import("@pages/ResetPasswordPage"),
      },
      {
        path: PATHS.VERIFY_EMAIL,
        handle: { title: "Verify email", noIndex: true },
        lazy: () => import("@pages/VerifyEmailPage"),
      },
      {
        path: PATHS.CONFIRM_EMAIL,
        handle: { title: "Confirm email", noIndex: true },
        lazy: () => import("@pages/ConfirmEmailPage"),
      },
      {
        // Outside GuestOnly: it must finish even while a session is being
        // picked up, and linking happens while signed in.
        path: PATHS.OAUTH_CALLBACK,
        handle: { title: "Signing in", noIndex: true },
        lazy: () => import("@pages/OAuthCallbackPage"),
      },
      {
        element: <RequireAuth />,
        children: [
          {
            // The account area is a shell (summary and section menu) around
            // one sub-page at a time; new sections such as orders or the
            // wishlist are added as further children.
            path: PATHS.ACCOUNT,
            handle: { title: "My account", noIndex: true },
            lazy: () => import("@pages/AccountPage"),
            children: [
              { index: true, element: <Navigate to={PATHS.ACCOUNT_PROFILE} replace /> },
              {
                path: PATHS.ACCOUNT_PROFILE,
                handle: { title: "Profile", noIndex: true },
                lazy: () => import("@pages/AccountPage/ProfilePage"),
              },
              {
                path: PATHS.ACCOUNT_SECURITY,
                handle: { title: "Security", noIndex: true },
                lazy: () => import("@pages/AccountPage/SecurityPage"),
              },
              {
                path: PATHS.ACCOUNT_ORDERS,
                handle: { title: "My orders", noIndex: true },
                lazy: () => import("@pages/AccountPage/OrdersPage"),
              },
              {
                path: PATHS.ACCOUNT_ORDER,
                handle: { title: "Order details", noIndex: true },
                lazy: () => import("@pages/AccountPage/OrderDetailPage"),
              },
            ],
          },
          {
            path: PATHS.CHECKOUT,
            handle: { title: "Checkout", noIndex: true },
            lazy: () => import("@pages/CheckoutPage"),
          },
          {
            // Where VNPay sends the shopper back after paying.
            path: PATHS.CHECKOUT_RESULT,
            handle: { title: "Payment result", noIndex: true },
            lazy: () => import("@pages/PaymentResultPage"),
          },
        ],
      },
      {
        path: PATHS.NOT_FOUND,
        lazy: () => import("@pages/NotFoundPage"),
      },
      // Any unknown URL lands on the dedicated not-found route.
      { path: "*", element: <Navigate to={PATHS.NOT_FOUND} replace /> },
    ],
  },
]);
