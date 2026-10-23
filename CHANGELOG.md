# app-shell Changelog

## 4.0.0

### Breaking Changes

* Changed the minimum Jahia version to 8.2.2.0. Upgrade Jahia to 8.2.2.0 or later before you install this version.

* `@jahia/moonstone` is no longer shared as a singleton. It is still pooled for deduplication. (#373)

* Make Jahia dashboard pages HTML5 (`<!DOCTYPE html>`). (#375)

  This change is breaking: it makes CSS selectors case-sensitive. Interfaces built with Moonstone are guaranteed to work, custom CSS has to be checked manually.

* Upgraded the shared singleton libraries across major versions. (#373)

  | Library              | Before    | After     |
  | -------------------- | --------- | --------- |
  | `@jahia/ui-extender` | `1.3.0`   | `2.0.0`   |
  | `i18next`            | `19.9.2`  | `23.16.8` |
  | `react-i18next`      | `11.18.6` | `15.7.4`  |
  | `react-redux`        | `8.1.3`   | `9.3.0`   |
  | `redux`              | `4.2.1`   | `5.0.1`   |

  The app-shell now loads these libraries before any UI extension, so every UI extension gets the versions above, whatever its `package.json` declares. A declared range that excludes them only logs a warning in the browser console. If your UI extension uses one of these libraries, test it against the new version and widen its declared range to include it.

* Opened the migration window for Vite-powered UI extensions. (#373)

  The app-shell now provides all the singleton libraries (e.g. React).

* Removed support for browsers without ES2022: Jahia editing interfaces now require Chrome or Edge 94, Firefox 93 or Safari 16.4 at least. (#373)

  The previous minimum was Chrome 60, Edge 44, Firefox 54 and Safari 12. Users on an older browser must update it to keep using the editing interfaces.

* Removed `i18next-xhr-backend`, `@apollo/react-common` and `@apollo/react-hooks` from the federation. (#373)

  Remotes that import them directly must declare them as their own dependencies. Prefer `@apollo/client/react` over the two Apollo packages, both of which have been deprecated since 2019.

### New Features

* The app-shell now shares React's subpath entry points (`react/jsx-runtime`, `react/jsx-dev-runtime` and `react-dom/client`). (#373)

  `react/jsx-dev-runtime` provides a working `jsxDEV` even when the app-shell is built for production, but development features are not reconstructed. This allows remotes compiled with the *development* automatic JSX runtime to run in a production app-shell, without shipping the React development build.

* `formik` is now shared as a singleton by the app-shell. (#373)

### Bug Fixes

* Added maven.jahia.com to the Maven repositories app-shell uses to download its dependencies.

## 3.4.0

* Changed the minimum Jahia version to 8.1.8.0. Upgrade Jahia to 8.1.8.0 or later before you install this version.

* Updated all JS dependencies of the federation host within their accepted SemVer range. (#372)
