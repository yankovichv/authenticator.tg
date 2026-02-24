# Authenticator for Telegram

Telegram Mini App for two-factor authentication (TOTP). Fully client-side, no backend.

- Website: https://authenticator.tg/ (redirects to bot)
- Bot: https://t.me/authenticatorapp_bot/
- Repository: https://github.com/yankovichv/authenticator.tg

## Architecture

- **Platform**: Telegram Mini App (TWA) via @twa-dev/sdk
- **Frontend**: React 18 class components + Redux Toolkit
- **Storage**: Telegram CloudStorage API (no server, no database)
- **OTP**: otpauth + otplib for TOTP generation, otpauth-migration for Google Authenticator import
- **Build**: Webpack 5, Babel, PostCSS + CSS Modules

## Project structure

```
app/
  index.jsx              — entry point
  components/            — reusable UI components (Block, CardCode, Spinner, etc.)
  containers/            — page-level components
    PageMain/            — main controller (state machine: process → empty → cards → edit)
    ThemeProvider/        — light/dark theme from Telegram
  helper/WebAppHelper.js — Telegram WebApp SDK wrapper
  lib/                   — utilities (totp, cache, theme, env)
  store/                 — Redux store + reducers
  assets/                — fonts (SF Pro Display), images
```

## Key patterns

- PageMain is a class component with view state machine (process/empty/cards/edit)
- All data persisted via WebAppHelper → Telegram CloudStorage
- TOTP URIs stored as array of {uuid, uri} objects
- QR scanning uses Telegram's native showScanQrPopup
- Google Authenticator bulk import via otpauth-migration library
- Theme colors resolved from Telegram's themeParams

## Commands

- `yarn serve` — dev server (port 9000)
- `yarn build` — production build → dist/
- `yarn test:eslint` — lint
- `yarn test:tsc` — type check

## Conventions

- Components: one folder per component with index.jsx + style.pcss
- Styles: PostCSS with Less syntax, CSS Modules for isolation
- Imports: use webpack aliases (@components, @containers, @lib, @store, @helper)
- No TypeScript files yet, but TS checking is configured via JSDoc/babel
