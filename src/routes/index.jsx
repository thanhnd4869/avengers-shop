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
            ],
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
