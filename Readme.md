# Authenticator for Telegram

A two-factor authentication (2FA) app that runs entirely inside Telegram as a Mini App. No servers, no accounts — your TOTP codes are stored securely in Telegram's cloud storage and available on any device where you use Telegram.

## Features

- Generate time-based one-time passwords (TOTP) for any service
- Import accounts by scanning QR codes
- Google Authenticator migration support (bulk import)
- Automatic light/dark theme matching with Telegram
- Cross-device sync via Telegram's built-in cloud storage
- Zero server infrastructure — fully client-side

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

## License

[MIT](LICENSE)
