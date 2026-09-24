# Project Instructions

## Product boundary

Spotified is a private, non-commercial Spotify companion that may stream songs and control playback for Premium users through the official Web Playback SDK. Playback-state mutations are allowed, but do not add Spotify playlist or library writes, app-generated listening analytics, taste profiles, recommendation scoring, audio-feature integrations, Last.fm data, or YouTube Music migration without a new provider-policy review.

Playback must remain user-initiated, unaltered, and visibly paired with exact Spotify metadata, artwork, and a link back to Spotify. The standalone "Data supplied by Spotify" disclaimer is shown only on the Settings page. Do not mix, synchronize, broadcast, download, or commercially monetize Spotify audio.

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
- Spotify API operations, refresh tokens, and client credentials stay server-side. The only browser-token exception is a short-lived access token returned by an authenticated, uncached endpoint directly to the Web Playback SDK callback; never persist, log, place in a URL, or otherwise expose that token.
- Web playback is Premium-only. Honor SDK playback restrictions and autoplay requirements, and do not start audio without a user action.
- Use `/playlists/{id}/items`, not the removed `/tracks` endpoint.
- Use immutable Spotify `account_id` for account linking.
- Local OAuth uses `127.0.0.1`, not `localhost`.
- All personalized pages must remain uncached across users.
- Keep provider metadata exact, linked back, and artwork unmodified; the `SpotifyAttribution` disclaimer is intentionally limited to Settings.
