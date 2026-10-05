---
# Allowed version bumps: patch, minor, major
app-shell: major
---

Upgraded the shared singleton libraries across major versions. (#373)

| Library              | Before    | After     |
| -------------------- | --------- | --------- |
| `@jahia/ui-extender` | `1.3.0`   | `2.0.0`   |
| `i18next`            | `19.9.2`  | `23.16.8` |
| `react-i18next`      | `11.18.6` | `15.7.4`  |
| `react-redux`        | `8.1.3`   | `9.3.0`   |
| `redux`              | `4.2.1`   | `5.0.1`   |

The app-shell now loads these libraries before any UI extension, so every UI extension gets the versions above, whatever its `package.json` declares. A declared range that excludes them only logs a warning in the browser console. If your UI extension uses one of these libraries, test it against the new version and widen its declared range to include it.
