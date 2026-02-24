<p align="center">
  <img src=".github/assets/promo-image.jpg" alt="Telegram Authenticator" width="600">
</p>

# Authenticator for Telegram

A [Telegram Mini App](https://core.telegram.org/bots/webapps) for generating One-Time Passwords (OTP) for your 2FA-protected accounts.

**Your data stays yours.** All secrets are stored exclusively in Telegram's encrypted cloud storage. The app has no server, no database, no analytics — it never sees, collects, or transmits your data. The code is open source, so you can verify this yourself.

**Available everywhere.** Your codes are automatically synced across all your Telegram clients — mobile, desktop, and web. Wherever you have Telegram, you have your authenticator.

<p align="center">
  <img src=".github/assets/screen-1.png" alt="Welcome screen" height="400">
  &nbsp;&nbsp;&nbsp;
  <img src=".github/assets/screen-2.png" alt="QR code scanner" height="400">
  &nbsp;&nbsp;&nbsp;
  <img src=".github/assets/screen-3.png" alt="TOTP codes list" height="400">
</p>

<p align="center">
  <a href="https://authenticator.tg/">Open in Telegram</a>
</p>

## Features

- Generate time-based one-time passwords (TOTP) for any service
- Scan QR codes or import from Google Authenticator (bulk migration supported)
- Synced across all your Telegram clients — phone, desktop, browser
- No servers, no accounts, no data collection — fully client-side
- Native Telegram look and feel with light/dark theme support

## Development

### Prerequisites

- Node.js 18+
- Yarn

### Quick start

```bash
yarn install
yarn serve
```

Dev server starts on port 9000.

### Build

```bash
yarn build
```

Production bundle is created in `dist/`.

### Linting

```bash
yarn test:eslint     # ESLint
yarn test:tsc        # TypeScript check
yarn test:prettier   # Formatting check
```

## Tech stack

- React 18 + Redux Toolkit
- Telegram WebApp SDK (@twa-dev/sdk)
- otpauth / otplib for TOTP generation
- Webpack 5
- PostCSS + CSS Modules

## Backlog

- [ ] Drag-and-drop reordering of accounts
- [ ] Add account by manual secret key entry
  - Show generated code immediately upon key input (before saving), with a Cancel option to discard — for users who store secrets externally and just need a quick one-time code

## License

[MIT](LICENSE)
