---
# Allowed version bumps: patch, minor, major
app-shell: major
---

Upgraded the shared singleton libraries across major versions. (#373)

| Library              | Before    | After      |
| -------------------- | --------- | ---------- |
| `@jahia/ui-extender` | `^1.0.3`  | `^2.0.0`   |
| `i18next`            | `^19.0.3` | `^23.16.8` |
| `react-i18next`      | `^11.2.7` | `^14.1.3`  |
| `react-redux`        | `^8.0.5`  | `^9.3.0`   |
| `redux`              | `^4.0.5`  | `^5.0.1`   |

Singletons resolve to the highest registered version regardless of what each remote asked for,
so a remote declaring a narrower `requiredVersion` will be handed one of the versions above and
only get a warning. Remotes should widen their ranges to match rather than rely on the
mismatch being tolerated.
