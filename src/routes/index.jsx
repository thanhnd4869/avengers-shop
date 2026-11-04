import { createBrowserRouter, Navigate } from "react-router";

import { GuestOnly, RequireAdmin, RequireAuth } from "@components/AuthGuard";
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
            lazy: () => import("@pages/LoginPage"),
          },
          {
            path: PATHS.REGISTER,
            lazy: () => import("@pages/RegisterPage"),
          },
          {
            path: PATHS.FORGOT_PASSWORD,
            lazy: () => import("@pages/ForgotPasswordPage"),
          },
        ],
      },
      {
        path: PATHS.RESET_PASSWORD,
        lazy: () => import("@pages/ResetPasswordPage"),
      },
      {
        path: PATHS.VERIFY_EMAIL,
        lazy: () => import("@pages/VerifyEmailPage"),
      },
      {
        path: PATHS.CONFIRM_EMAIL,
        lazy: () => import("@pages/ConfirmEmailPage"),
      },
      {
        // Outside GuestOnly: it must finish even while a session is being
        // picked up, and linking happens while signed in.
        path: PATHS.OAUTH_CALLBACK,
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
            lazy: () => import("@pages/AccountPage"),
            children: [
              { index: true, element: <Navigate to={PATHS.ACCOUNT_PROFILE} replace /> },
              {
                path: PATHS.ACCOUNT_PROFILE,
                lazy: () => import("@pages/AccountPage/ProfilePage"),
              },
              {
                path: PATHS.ACCOUNT_SECURITY,
                lazy: () => import("@pages/AccountPage/SecurityPage"),
              },
              {
                path: PATHS.ACCOUNT_ORDERS,
                lazy: () => import("@pages/AccountPage/OrdersPage"),
              },
              {
                path: PATHS.ACCOUNT_ORDER,
                lazy: () => import("@pages/AccountPage/OrderDetailPage"),
              },
            ],
          },
          {
            path: PATHS.CHECKOUT,
            lazy: () => import("@pages/CheckoutPage"),
          },
          {
            // Where VNPay sends the shopper back after paying.
            path: PATHS.CHECKOUT_RESULT,
            lazy: () => import("@pages/PaymentResultPage"),
          },
        ],
      },
      {
        element: <RequireAdmin />,
        children: [
          {
            path: PATHS.ADMIN,
            element: <Navigate to={PATHS.ADMIN_CONTACT_MESSAGES} replace />,
          },
          {
            path: PATHS.ADMIN_CONTACT_MESSAGES,
            lazy: () => import("@pages/AdminContactMessagesPage"),
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
