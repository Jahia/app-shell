---
# Allowed version bumps: patch, minor, major
app-shell: major
---

Removed `i18next-xhr-backend`, `@apollo/react-common` and `@apollo/react-hooks` from the federation. (#373)

Remotes that import them directly must declare them as their own dependencies. Prefer `@apollo/client/react` over the two Apollo packages, both of which have been deprecated since 2019.
