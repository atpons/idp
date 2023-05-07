# idp

🌍 Cloudflare Workers (+ Remix) + 📁 Cloudflare D1 (+ Drizzle ORM) + 🧀 Cloudflare KV + 🔑 WebAuthn (Passkey autofill / Conditional UI)

## Disclaimer

**This is a PoC application and is not suitable for production use.**

## Description

This is a simple WebAuthn (Passkey) Identity Provider (IdP) that uses Cloudflare Workers, Cloudflare D1, and Cloudflare KV to provide a simple, serverless identity provider.

## Mechanism

- The login page initiates the WebAuthn attestation sequence using the SimpleWebAuthn library.
- Passkey Autofill is enabled based on information obtained from `/assertion/options`.
  - If a valid authenticator is available, the application proceeds with logging in using `/assertion/result`.
    - User information is retrieved from Cloudflare D1 at this point.
- If there is no user information available from Passkey Autofill, the user is prompted to enter their username.
  - A session with the entered username is generated at `/login`.
  - SimpleWebAuthn initiates the authenticator registration using `/assertion/options` (resident Key is required)
  - The result is sent to `/assertion/result`
    - The session and result are retrieved and saved in Cloudflare D1 with the user's information.
- Each challenge is saved in Cloudflare KV.
- The login request is implemented as a Strategy in remix-auth.
- Login session is managed by remix-auth and Cloudflare KV.

## Dependencies

- [@hexagon/base64](https://www.npmjs.com/package/@hexagon/base64)
- [@remix-run/cloudflare](https://www.npmjs.com/package/@remix-run/cloudflare)
- [@remix-run/cloudflare-pages](https://www.npmjs.com/package/@remix-run/cloudflare-pages)
- [@simplewebauthn/browser](https://www.npmjs.com/package/@simplewebauthn/browser)
- [@simplewebauthn/server](https://www.npmjs.com/package/@simplewebauthn/server)
- [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)
- [drizzle-orm](https://www.npmjs.com/package/drizzle-orm)
- [remix-auth](https://www.npmjs.com/package/remix-auth)

## References

- [Cloudflare D1 で ORM を使う (drizzle-orm)](https://zenn.dev/mizchi/articles/d1-drizzle-orm)
-  [GW は ORM を作るぞと思っていたがまずフルスタック環境を仕上げたい](https://zenn.dev/mizchi/scraps/fda07433250e82)