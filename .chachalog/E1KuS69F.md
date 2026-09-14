---
# Allowed version bumps: patch, minor, major
app-shell: major
---

Make Jahia dashboard pages HTML5 (`<!DOCTYPE html>`). (#375)

This change is breaking: it makes CSS selectors case-sensitive. Interfaces built with Moonstone are guaranteed to work, custom CSS has to be checked manually.
