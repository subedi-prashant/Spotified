# Spotified

Spotified is a private, read-only Next.js companion for a Spotify account. It presents Spotify-supplied affinity rankings, recently played tracks, saved tracks, playlists, permitted playlist contents, and manual catalog search in an independent interface.

It deliberately does **not** calculate listening time, play counts, top genres, discovery rates, taste profiles, or personalized recommendations from Spotify data. Spotify's current Developer Policy restricts derived listening analytics and user profiling, and several older recommendation/audio endpoints are unavailable to new applications.

## Stack

- Next.js 16 App Router, React, and strict TypeScript
- Tailwind CSS and local shadcn/ui components
- Supabase PostgreSQL
- Drizzle ORM and generated SQL migrations
- Spotify Web API with the server-side Authorization Code flow
- Vitest, ESLint, and Prettier
- Vercel-compatible Node.js route handlers

## Prerequisites

- Node.js 24 or newer
- A Spotify Premium account that owns the Development Mode app
- A Spotify Developer application
- A Supabase project

Spotify Development Mode currently supports at most five allowlisted users. Add each test account under the app's **Users Management** page before connecting it.

## Spotify application setup

1. Create an application in the Spotify Developer Dashboard.
2. Add this exact local redirect URI:

   ```text
   http://127.0.0.1:3000/api/auth/spotify/callback
   ```

   Spotify does not accept `localhost` as a redirect URI. Use the explicit loopback IP.

3. For production, add the exact stable HTTPS callback, for example:

   ```text
   https://your-domain.example/api/auth/spotify/callback
   ```

4. Add approved beta users in **Users Management**.
5. Keep the client secret server-side. Never prefix it with `NEXT_PUBLIC_`.

The app requests only:

- `playlist-read-collaborative`
- `playlist-read-private`
- `user-library-read`
- `user-read-recently-played`
- `user-top-read`

## Supabase setup

Use the Supabase **Shared Pooler / transaction mode** URL for `DATABASE_URL` because Vercel functions are short-lived. Runtime Postgres.js connections disable prepared statements, as required by transaction pooling.

Use the direct or session-mode connection as `DATABASE_MIGRATION_URL` when your network supports it. This URL is used only by Drizzle CLI commands.

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values.

3. Generate a 32-byte token-encryption key:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

4. Apply the committed migration to Supabase:

   ```powershell
   npm run db:migrate
   ```

5. Start the app:

   ```powershell
   npm run dev
   ```

6. Open `http://127.0.0.1:3000`.

## Environment variables

| Variable                            | Purpose                                                             |
| ----------------------------------- | ------------------------------------------------------------------- |
| `APP_BASE_URL`                      | Stable origin used for same-origin checks, without a trailing slash |
| `DATABASE_URL`                      | Supabase transaction-pooler runtime connection                      |
| `DATABASE_MIGRATION_URL`            | Direct/session connection for Drizzle migrations                    |
| `SPOTIFY_CLIENT_ID`                 | Spotify application client ID                                       |
| `SPOTIFY_CLIENT_SECRET`             | Server-only Spotify client secret                                   |
| `SPOTIFY_REDIRECT_URI`              | Exact registered callback URI                                       |
| `TOKEN_ENCRYPTION_KEY`              | Base64url-encoded 32-byte AES-256 key                               |
| `NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL` | Contact shown in privacy and terms pages                            |

Never commit `.env.local`, tokens, database passwords, or provider secrets.

## Commands

```powershell
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run format:check
npm run db:generate
npm run db:migrate
```

Generate a new migration only after intentionally changing `src/db/schema.ts`. Review generated SQL before applying it. Do not use destructive schema pushes against production.

## Security design

- OAuth state is random, short-lived, HTTP-only, and compared in constant time.
- Spotify tokens never reach browser JavaScript or client API responses.
- Tokens are encrypted with AES-256-GCM before entering PostgreSQL.
- Browser sessions use random opaque values; only SHA-256 hashes are stored.
- Session and OAuth cookies are HTTP-only, SameSite=Lax, and Secure in production.
- POST routes verify the request origin.
- A Spotify 401 triggers one forced refresh. `invalid_grant` discards unusable tokens and requires reconnection.
- Spotify refresh tokens expire six months after the original authorization under the current platform rules.
- Disconnecting deletes the local user, account credentials, and every session through foreign-key cascades.
- Personalized pages use request-time data and do not use a shared public cache.

## Deployment

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Configure all environment variables separately for production.
4. Register the production HTTPS redirect URI in Spotify before testing OAuth.
5. Apply database migrations explicitly from a trusted environment.
6. Review and replace the privacy contact value.
7. Have the project owner review the privacy and end-user terms before allowing another user to connect.

Vercel Hobby is for personal, non-commercial use. Supabase Free currently pauses inactive projects and does not provide the same backup guarantees as a paid plan. A publicly reachable Vercel URL does not bypass Spotify's five-user Development Mode allowlist.

## Provider and UI constraints

- The user-facing product name is **Spotified**.
- Spotify artwork is shown without cropping, overlays, distortion, or animation.
- Spotify metadata links back to the relevant Spotify page and includes source attribution.
- Playlist contents are available only for playlists the account owns or collaborates on; a followed playlist can appear in Collections while its items remain unavailable.
- Search is manual and limited to Spotify's current maximum of ten results per item type.
- No Spotify recommendations, related-artists API, audio features, audio analysis, preview-audio dependency, playlist writes, Last.fm integration, or YouTube Music migration is included.

## Verification without real credentials

Unit tests use mocked provider responses and require no secrets. A real end-to-end OAuth smoke test requires a configured Supabase database, Spotify application credentials, Premium app owner, and an allowlisted Spotify account.
