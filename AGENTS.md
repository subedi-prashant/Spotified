# Project Instructions

## Product boundary

Spotified is a read-only Spotify utility. Do not add app-generated listening analytics, taste profiles, recommendation scoring, audio-feature integrations, playlist writes, Last.fm data, or YouTube Music migration without a new provider-policy review.

## Commands

- Development: `npm run dev`
- Type checking: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm run test`
- Production build: `npm run build`
- Format check: `npm run format:check`
- Generate migration: `npm run db:generate`
- Apply migrations: `npm run db:migrate`

Run typecheck, lint, tests, and build before considering implementation complete.

## Implementation notes

- Next.js 16 request APIs and route props are asynchronous.
- Use the Supabase transaction pooler at runtime with Postgres.js `prepare: false`.
- Spotify client code stays server-side; never expose tokens to client components.
- Use `/playlists/{id}/items`, not the removed `/tracks` endpoint.
- Use immutable Spotify `account_id` for account linking.
- Local OAuth uses `127.0.0.1`, not `localhost`.
- All personalized pages must remain uncached across users.
- Keep provider metadata exact, attributed, linked back, and artwork unmodified.
