# Contributing

Thanks for your interest in contributing to Authenticator for Telegram!

## Getting started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/authenticator.tg.git`
3. Install dependencies: `yarn install`
4. Start the dev server: `yarn serve`

## Making changes

1. Create a branch: `git checkout -b my-feature`
2. Make your changes
3. Run the checks: `yarn test:unit && yarn test:eslint`
4. Commit with a clear message
5. Push and open a Pull Request

## Guidelines

- Keep changes focused — one feature or fix per PR
- Follow the existing code style (ESLint is configured)
- Test your changes inside Telegram (use ngrok for local development)
- Anything touching `app/lib/storage.js` needs a test in `test/storage.cjs` —
  a bug there costs people the 2FA keys they cannot recover

## Reporting issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Device and Telegram version

## Questions?

Open an issue — we're happy to help.
