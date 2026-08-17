# Authenticator for Telegram

Telegram Mini App for two-factor authentication (TOTP). Fully client-side, no backend.

- Website: https://authenticator.tg/ (redirects to bot)
- Bot: https://t.me/authenticatorapp_bot/
- Repository: https://github.com/yankovichv/authenticator.tg

## Telegram platform docs

- https://core.telegram.org/bots — Bots overview and sub-pages
- https://core.telegram.org/bots/api — Bot API (available to bots and mini apps)
- https://core.telegram.org/bots/webapps — Mini Apps (formerly Web Apps) documentation

## Architecture

- **Platform**: Telegram Mini App (TWA) via @twa-dev/sdk
- **Frontend**: React 18 class components + Redux Toolkit
- **Storage**: Telegram CloudStorage API (no server, no database), one key per account
- **OTP**: otpauth + otplib for TOTP generation, otpauth-migration for Google Authenticator import
- **Build**: Webpack 5, Babel, PostCSS + CSS Modules

## Project structure

```
app/
  index.jsx              — entry point
  components/            — reusable UI components (Block, CardCode, Spinner, etc.)
  containers/            — page-level components
    PageMain/            — main controller (process → error → empty → cards → export → edit)
    ThemeProvider/        — light/dark theme from Telegram
  helper/WebAppHelper.js — Telegram WebApp SDK wrapper
  lib/storage.js         — accounts in CloudStorage: load, add, move, remove, migration
  lib/                   — utilities (totp, cache, theme, env)
  store/                 — Redux store + reducers
  assets/                — fonts (SF Pro Display), images
test/                    — node tests for storage and QR parsing (`yarn test:unit`)
```

## Key patterns

- PageMain is a class component with view state machine (process/error/empty/cards/export/edit)
- All data persisted via WebAppHelper → Telegram CloudStorage

**Storage rules — these exist because breaking them loses people's 2FA keys:**

- One account per key, `acc_<uuid>` → `{uri, order, group}`. Telegram caps a value
  at 4096 characters; the original single-key layout silently stopped saving past
  ~21 accounts and the app reported success anyway.
- Never swallow a CloudStorage result. `setItem` answers with both an error and a
  stored flag, and both mean the account was not saved.
- A failed read is not an empty list. Show the error view, never the empty state —
  otherwise the app invites the user to add accounts on top of data it cannot see.
- The legacy `uris` key is never deleted. `uris_backup_v1` holds an untouched copy
  from migration time; `uris` is mirrored (truncated to what fits) so an older
  cached version of the app keeps working, and anything it adds is imported back.
- Migrated accounts are read back and compared before migration counts as done.
- Legacy entries are matched by uri as well as uuid — an entry that lost its uuid
  would otherwise be re-imported on every launch.
- Reordering writes only the moved account (fractional order between neighbours),
  falling back to renumbering the list when float precision runs out.
- QR scanning uses Telegram's native showScanQrPopup; `ensureURIs` returns an empty
  list for anything malformed instead of throwing
- Google Authenticator bulk import via otpauth-migration library
- Theme colors resolved from Telegram's themeParams

## Commands

- `yarn serve` — dev server (port 9000)
- `yarn build` — production build → dist/
- `yarn test:unit` — storage and QR parsing tests (no browser needed)
- `yarn test:eslint` — lint
- `yarn test:tsc` — type check

## Deployment

Cloudflare Pages, project `authenticator` in the personal **Yankovich** account,
served at `app.authenticator.tg`. The root domain is a Cloudflare redirect rule to
the bot, scoped to `Hostname equals authenticator.tg` — an unscoped rule would
swallow the mini app too.

```
yarn build
CLOUDFLARE_ACCOUNT_ID=b39caa427746be94ce6e2a9f8b5a25ba \
  npx wrangler pages deploy dist --project-name authenticator --branch main
```

The custom domain takes up to a minute to serve a fresh deployment; verify against
`authenticator-1g9.pages.dev` first. Rolling back is a previous deployment in the
Cloudflare dashboard.

## Backlog

- [ ] Add account by manual secret key entry (alternative to QR scanning)
  - Show generated code immediately upon key input, with a Cancel option
- [ ] Tags for accounts (`group` field already exists in storage, UI does not)
- [ ] Service icons or coloured initials to speed up visual search

## Conventions

- Components: one folder per component with index.jsx + style.pcss
- Styles: PostCSS with Less syntax, CSS Modules for isolation
- Imports: use webpack aliases (@components, @containers, @lib, @store, @helper)
- No TypeScript files yet, but TS checking is configured via JSDoc/babel
