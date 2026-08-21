---
# Allowed version bumps: patch, minor, major
app-shell: major
---

Three libraries are no longer provided by the federation; remotes using them must declare and bundle their own copy. (#373)

| Library                | Why it went                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `i18next-xhr-backend`  | Deprecated; the host now loads translations with `i18next-http-backend`, which it does not share |
| `@apollo/react-common` | Reached remotes only as a transitive dependency of `react-apollo`; no longer federated           |
| `@apollo/react-hooks`  | Same as above — use `@apollo/client/react` instead                                               |
