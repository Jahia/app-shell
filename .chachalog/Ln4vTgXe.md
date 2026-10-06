---
# Allowed version bumps: patch, minor, major
app-shell: minor
---

The app-shell now shares React's subpath entry points (`react/jsx-runtime`, `react/jsx-dev-runtime` and `react-dom/client`). (#373)

`react/jsx-dev-runtime` provides a working `jsxDEV` even when the app-shell is built for production, but development features are not reconstructed. This allows remotes compiled with the _development_ automatic JSX runtime to run in a production app-shell, without shipping the React development build.
