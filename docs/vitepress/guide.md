---
title: User & Developer Guide
---

# User & Developer Guide

## Getting Started

See [Getting Started](../getting-started) for full setup instructions.

## Project Structure

- `client/src/components/`: Vue components (UI building blocks)
- `client/src/services/`: API and utility services (HTTP, logging, etc.)
- `client/src/stores/`: Pinia stores (state management)
- `client/src/views/`: Main app views/pages
- `server/src/`: Backend API, config, Casbin RBAC, session/auth

## Extending the App

- Add new components to `client/src/components/` and document props/events in the `<script>` block
- Add new pages to `client/src/views/`
- Update navigation in `docs/vitepress/.vitepress/config.mjs`
- Add backend endpoints in `server/src/` and update Swagger spec

## Documentation Tips

- Use Markdown for guides and examples
- Add JSDoc comments to JS and Vue files for auto-generated docs
- Use VitePress for live docs and search
- Keep API and architecture docs up to date