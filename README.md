# Avengers Shop

The customer-facing storefront: a React 19 app built with JavaScript, Webpack 5,
and Babel. The admin app lives in `avengers-admin` and both talk to
`avengers-api`.

## Technology Stack

- React 19 and React DOM
- React Router for client-side routing
- Bootstrap 5 with React Bootstrap as the only UI library
- JavaScript and JSX
- Webpack 5 and Webpack Dev Server
- Babel 8
- CSS with `style-loader` and `css-loader`
- ESLint 9 with React and React Hooks rules
- Prettier
- Husky and lint-staged
- Commitlint with Conventional Commits

## Requirements

- Node.js 20.19.0 or later
- npm 10 or later

## Getting Started

1. Install dependencies:

   ```shell
   npm install
   ```

2. Create the local environment file:

   ```shell
   cp .env.example .env
   ```

   On Windows Command Prompt, use:

   ```bat
   copy .env.example .env
   ```

3. Start the development server:

   ```shell
   npm run dev
   ```

The application opens automatically at `http://localhost:3000` by default.

## Environment Variables

| Variable            | Default                        | Description                                                   |
| ------------------- | ------------------------------ | ------------------------------------------------------------- |
| `WEBPACK_APP_NAME`  | `Avengers Store`               | Application name exposed to the browser bundle.               |
| `WEBPACK_API_URL`   | `http://localhost:8000/api/v1` | Backend API; `robots.txt` points at its `/sitemap.xml`.       |
| `WEBPACK_SITE_URL`  | the page's origin              | Public shop origin for canonical links and link previews.     |
| `WEBPACK_ADMIN_URL` | empty                          | Admin dashboard; shows an "Admin" menu link to administrators |
| `HOST`              | `localhost`                    | Webpack development server host.                              |
| `PORT`              | `3000`                         | Webpack development server port.                              |

Only variables prefixed with `WEBPACK_` are exposed to browser code. `HOST` and `PORT` are used only by the Webpack configuration.

Do not store secrets in variables exposed to the browser bundle. Use `.env.local` or mode-specific local environment files for local overrides, and never commit sensitive values.

## Available Scripts

| Script                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Starts the development server with hot reloading.        |
| `npm run build`        | Creates an optimized production build in `build/`.       |
| `npm run lint`         | Checks the project with ESLint.                          |
| `npm run lint:fix`     | Fixes ESLint issues that can be corrected automatically. |
| `npm run format`       | Formats supported files with Prettier.                   |
| `npm run format:check` | Checks formatting without modifying files.               |
| `npm run lint:staged`  | Lints and formats staged files.                          |
| `npm run commitlint`   | Validates a commit message.                              |
| `npm run prepare`      | Initializes Husky Git hooks.                             |

All scripts are designed to run on Windows, macOS, and Linux.

## Code Conventions

- Use `.jsx` for files containing JSX or React UI components.
- Use `.js` for JavaScript files that do not contain JSX.
- Import across layers through their alias, and use a relative path only for
  files that sit in the same folder.
- ESLint runs during Webpack compilation. In development, lint errors appear in the terminal and the overlay while the server keeps watching, so fixing them recovers on its own; a production build fails on them.
- Prettier handles code formatting.
- `react/prop-types` is disabled because React 19 removed runtime prop type
  checking, which makes `propTypes` declarations dead code.

## Git Hooks and Commit Messages

The pre-commit hook runs lint-staged:

- JavaScript and JSX files are fixed with ESLint and formatted with Prettier.
- JSON, Markdown, HTML, CSS, and YAML files are formatted with Prettier.

Commit messages must:

- Follow the Conventional Commits specification.
- Contain exactly one line.
- Use English ASCII characters only.

Examples:

```text
feat: add navigation component
fix(webpack): resolve development overlay issue
docs: update setup instructions
```

## Architecture

The project uses a **layer-based** architecture. Files are grouped by their
technical role, so each top-level folder under `src/` answers a single question:
what kind of code lives here?

| Folder        | Contains                                                            |
| ------------- | ------------------------------------------------------------------- |
| `components/` | Reusable presentational components shared across pages.             |
| `pages/`      | One component per screen. Composes components into a full view.     |
| `routes/`     | Route definitions and the path constants they are built from.       |
| `hooks/`      | Reusable custom React hooks.                                        |
| `services/`   | Communication with external systems, mainly HTTP requests.          |
| `utils/`      | Pure helper functions with no React or network dependency.          |
| `constants/`  | Shared constant values and configuration read from the environment. |

Folders that hold no code yet contain a `.gitkeep` file, because Git does not
track empty directories. Delete that file once the folder has real content.

### Conventions

- Every component and page lives in its own `PascalCase` folder, and the files
  inside repeat that name:

  ```text
  components/Layout/
  ├── Layout.jsx     the component
  └── index.js       public entry point
  ```

  A `Layout.css` file joins the folder only when Bootstrap classes cannot express
  the styling.

  Grouping this way keeps a component and everything it owns together, so adding
  a sub-component later does not clutter the parent folder.

- `index.js` re-exports the component so it can be imported by folder name:

  ```js
  export { default } from "./Layout";
  ```

  This keeps import paths short and marks the folder boundary: anything not
  re-exported is internal and should not be imported from outside the folder.

- One component per file. Components in `components/` use a default export, while
  pages export a named `Component`, which is the shape the router's `lazy` option
  expects:

  ```jsx
  export function Component() { ... }
  Component.displayName = "HomePage";
  ```

  `displayName` is set so React DevTools and error messages show the page name
  instead of the generic `Component`.

- Styling uses Bootstrap classes. Any custom class added alongside them follows
  the BEM pattern, scoped by the component name.
- Layers that hold plain modules, such as `hooks/` and `utils/`, keep their files
  flat because they have no companion files to group.
- `pages/` may import from every other folder. `components/`, `hooks/`,
  `services/`, `utils/`, and `constants/` must not import from `pages/`, which
  keeps reusable code free of screen-specific logic.

### Naming

Naming follows what a file exports: components are `PascalCase`, everything else
is `camelCase`.

| Layer         | Naming                        | Example                       |
| ------------- | ----------------------------- | ----------------------------- |
| `components/` | `PascalCase` folder and files | `Button/Button.jsx`           |
| `pages/`      | `PascalCase`, `Page` suffix   | `HomePage/HomePage.jsx`       |
| `hooks/`      | `camelCase`, `use` prefix     | `useAuth.js`                  |
| `services/`   | `camelCase`                   | `authService.js`              |
| `utils/`      | `camelCase`                   | `formatDate.js`               |
| `constants/`  | `camelCase` file              | `app.js` exporting `APP_NAME` |

The `use` prefix on hooks is required rather than cosmetic: React and
`eslint-plugin-react-hooks` rely on it to detect hooks and apply the Rules of
Hooks. Constant files are named like any other module, and only the exported
values use `UPPER_SNAKE_CASE`.

### Path Aliases

Each layer has an import alias, so modules are referenced by their layer instead
of by a relative path such as `../../components/Layout`.

| Alias          | Resolves to       |
| -------------- | ----------------- |
| `@components/` | `src/components/` |
| `@constants/`  | `src/constants/`  |
| `@hooks/`      | `src/hooks/`      |
| `@pages/`      | `src/pages/`      |
| `@routes/`     | `src/routes/`     |
| `@services/`   | `src/services/`   |
| `@utils/`      | `src/utils/`      |

```jsx
import Layout from "@components/Layout";
import { APP_NAME } from "@constants/app";
```

A component is imported by its folder name because the `index.js` inside that
folder re-exports it. Importing the inner file directly, such as
`@components/Layout/Layout`, also works but bypasses the folder's public entry
point and should be avoided.

Aliases are declared in two files that must be kept in sync: `resolve.alias` in
`webpack.config.js` resolves them during bundling, and `paths` in
`jsconfig.json` enables editor navigation and autocompletion. Adding a new layer
means adding it to both files.

A stylesheet is still imported with a relative path (`./HomePage.css`) because it
sits next to the component that owns it.

An alias that points at a missing module fails the Webpack build with
`Module not found`. ESLint does not verify import paths, so a broken import is
reported at build time rather than by `npm run lint`.

## Project Structure

```text
avengers-shop/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── index.js
│   │   │   └── Layout.jsx
│   │   └── PageLoader/
│   │       ├── index.js
│   │       └── PageLoader.jsx
│   ├── constants/
│   │   └── app.js
│   ├── hooks/
│   │   └── .gitkeep
│   ├── pages/
│   │   ├── HomePage/
│   │   │   ├── HomePage.jsx
│   │   │   └── index.js
│   │   └── NotFoundPage/
│   │       ├── index.js
│   │       └── NotFoundPage.jsx
│   ├── routes/
│   │   ├── index.jsx
│   │   └── paths.js
│   ├── services/
│   │   └── .gitkeep
│   ├── utils/
│   │   └── .gitkeep
│   ├── App.jsx
│   ├── index.css
│   └── index.jsx
├── .env.example
├── .babelrc
├── commitlint.config.js
├── eslint.config.js
├── jsconfig.json
├── lint-staged.config.js
├── package.json
└── webpack.config.js
```

## Styling

Bootstrap 5 is the only UI library in the project, used through two packages:
`bootstrap` for the stylesheet and `react-bootstrap` for its React components. No
other component or styling library may be added, so interface work uses Bootstrap
components and classes first, and falls back to a small amount of custom CSS only
when Bootstrap has no equivalent.

Bootstrap is imported once in `src/index.jsx`, before `src/index.css`, so project
styles can override it:

```jsx
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
```

Only the stylesheet is taken from the `bootstrap` package. Its JavaScript plugins
are not used: they manipulate the DOM directly, which conflicts with how React
owns it and causes bugs such as dropdowns stuck open. Bootstrap documents this
limitation and points React projects to React Bootstrap, which reimplements the
same behaviour as React components.

The two packages are not competing libraries. React Bootstrap ships no CSS at
all, so it depends on the `bootstrap` stylesheet for every visual style:

| Package           | Provides                    |
| ----------------- | --------------------------- |
| `bootstrap`       | The stylesheet              |
| `react-bootstrap` | React components, no styles |

Import components individually so the bundle only includes what is used:

```jsx
import Button from "react-bootstrap/Button";
```

Use the `as` prop to keep Bootstrap styling while rendering a different element,
which is how a router link becomes a button:

```jsx
<Button as={Link} to={PATHS.HOME} variant="primary">
  Back to home
</Button>
```

Bootstrap Reboot already handles the CSS reset, so `src/index.css` holds only the
few rules Reboot does not cover.

## Routing

Routing uses the `react-router` package. Note that `react-router-dom` is not
used: since version 7 it only re-exports `react-router`, and it has not followed
the move to version 8.

Routes live in `src/routes/index.jsx` and are built from the path constants in
`src/routes/paths.js`, so a URL is written once and referenced everywhere else:

```jsx
import { PATHS } from "@routes/paths";

<Link to={PATHS.HOME}>Back to home</Link>;
```

| Path                                            | Page                            | Access                  |
| ----------------------------------------------- | ------------------------------- | ----------------------- |
| `/`                                             | `HomePage`                      | Everyone                |
| `/shop`                                         | `ShopPage`                      | Everyone                |
| `/products/:slug`                               | `ProductPage`                   | Everyone                |
| `/cart`                                         | `CartPage`                      | Everyone                |
| `/blog`, `/blog/:slug`                          | `BlogPage`, `PostPage`          | Everyone                |
| `/gallery`                                      | `GalleryPage`                   | Everyone                |
| `/search`                                       | `SearchPage`                    | Everyone                |
| `/faq`, `/refund-policy`, `/terms`, `/privacy`  | `ContentPage`                   | Everyone                |
| `/login`                                        | `LoginPage`                     | Signed-out visitors     |
| `/register`                                     | `RegisterPage`                  | Signed-out visitors     |
| `/forgot-password`                              | `ForgotPasswordPage`            | Signed-out visitors     |
| `/reset-password`                               | `ResetPasswordPage`             | Everyone (emailed link) |
| `/verify-email`                                 | `VerifyEmailPage`               | Everyone (emailed link) |
| `/confirm-email`                                | `ConfirmEmailPage`              | Everyone (emailed link) |
| `/oauth/callback`                               | `OAuthCallbackPage`             | Everyone (from the API) |
| `/account`                                      | Redirects to `/account/profile` | Signed-in visitors      |
| `/account/profile`, `/account/security`         | `ProfilePage`, `SecurityPage`   | Signed-in visitors      |
| `/account/orders`, `/account/orders/:number`    | `OrdersPage`, `OrderDetailPage` | Signed-in visitors      |
| `/checkout/:number`, `/checkout/:number/result` | `CheckoutPage`, `PaymentResult` | Signed-in visitors      |
| `/not-found`                                    | `NotFoundPage`                  | Everyone                |
| `*`                                             | Redirects to `/not-found`       |                         |

Administration lives in the separate `avengers-admin` app; set
`WEBPACK_ADMIN_URL` to link administrators to it from the account menu.

`GuestOnly` and `RequireAuth` in `src/components/AuthGuard` wrap these routes. A signed-out visitor on `/account` is sent to sign in and
brought back afterwards.

`AccountPage` is the shell of the account area: it renders the account summary
and section menu (`AccountSidebar`) beside an `<Outlet />` for the current
sub-page. The header's `AccountMenu` lists the same sections, both read from
`ACCOUNT_NAV_ITEMS` in `src/routes/accountNav.js`. A new section, such as order
history or the wishlist, is a child route under `PATHS.ACCOUNT` plus one entry
in that list.

### SEO

`Seo` (`src/components/Seo`) sets each page's title, description, canonical
URL, Open Graph and Twitter preview tags, and schema.org JSON-LD: `WebSite`
with a search action on the home page, `Product` with its price range, stock
and rating on game pages, `BlogPosting` on posts and `FAQPage` on the FAQ.
Private pages (cart, checkout, account, sign-in and email links) declare
`handle: { title, noIndex: true }` on their route instead, and `Layout` marks
them `noindex`; searches and price-filtered shop listings are `noindex` too.

`public/robots.txt` keeps crawlers out of those pages and points them at the
API's `/sitemap.xml`, which lists the fixed pages and every published game and
post; the build fills in the sitemap URL from `WEBPACK_API_URL`. The shop is
rendered in the browser, so crawlers that do not run JavaScript only see the
defaults in `public/index.html`; prerendering or server rendering would be the
next step if that matters.

Sign-in with Google and Facebook is driven by the API. `SocialSignIn` shows a
button for each provider the API reports, asks the API for the provider's URL
and leaves the page. The API sends the visitor back to `/oauth/callback`, which
picks up the new session (or explains the error code from
`src/constants/oauth.js`) and moves on to the page the visitor came from.

`Layout` is the parent route and renders the active page through `<Outlet />`,
which keeps the shell mounted while only the page below it changes. Pages
therefore render their own content and must not wrap themselves in `Layout`.

The catch-all route redirects with `replace`, so an unknown URL does not stay in
the history stack and the browser back button returns to the previous real page.

Deep links such as `/not-found` work in development because
`devServer.historyApiFallback` serves `index.html` for unknown paths. A
production host must be configured to do the same.

Pages are attached with the router's `lazy` option rather than imported directly,
so each one is emitted as its own chunk and downloaded only when its route is
visited:

```jsx
{ path: PATHS.HOME, lazy: () => import("@pages/HomePage") }
```

`lazy` merges the resolved module's exports into the route object, so a page that
exports a named `Component` needs no further wiring. `HydrateFallback` renders
`PageLoader` while the first page chunk is still loading.

This project runs React Router in data mode, where routes are declared through
`createBrowserRouter`. The framework mode documented on the React Router site
declares routes in a `routes.ts` file and requires its own Vite plugin, which
does not apply to this Webpack setup.

## Production Build

Create an optimized build:

```shell
npm run build
```

Webpack writes the output to `build/`, cleans stale files, generates source maps,
and uses content-hashed filenames for long-term caching.

The build is split so the browser downloads and caches as little as possible:

| Output        | Contents                                         |
| ------------- | ------------------------------------------------ |
| `runtime.js`  | Webpack runtime, isolated so it can change alone |
| `vendors.js`  | Third-party packages                             |
| `main.js`     | Application code                                 |
| `<id>.js`     | One chunk per lazily loaded page                 |
| `vendors.css` | Bootstrap stylesheet                             |
| `main.css`    | Project stylesheet                               |

CSS is extracted into real stylesheets by `mini-css-extract-plugin` instead of
being injected by JavaScript. The browser can then download CSS and JavaScript in
parallel, styles are cached separately from application code, and the page no
longer renders unstyled while the bundle loads. `style-loader` is still used in
development because it supports hot reloading.

Stylesheets are minified by `css-minimizer-webpack-plugin`. It is registered
alongside `"..."` in `optimization.minimizer`, which preserves the default
JavaScript minifier that would otherwise be replaced.

Because application code, dependencies, and pages are hashed independently,
editing a page invalidates only that page's chunk and leaves the cached vendor
and stylesheet files untouched.
