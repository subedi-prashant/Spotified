import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy",
};

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const parameters = await searchParams;
  const contact =
    process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL ??
    "the app owner who invited you to this private beta";

  return (
    <LegalPage
      title="Privacy notice"
      description="What Spotified receives, what it stores, why it needs that data, and how to remove it."
    >
      {parameters.notice === "consent_required" ? (
        <div
          className="rounded-2xl border border-amber-300/20 bg-amber-300/5 px-5 py-4 text-amber-100"
          role="status"
        >
          Review this notice and the terms before using the Connect Spotify button.
        </div>
      ) : null}

      <LegalSection title="Who controls the data">
        <p>
          Spotified is a private, non-commercial side project. The project owner who invited you to
          the Spotify Development Mode allowlist operates this deployment and controls the data
          described here.
        </p>
      </LegalSection>

      <LegalSection title="Data collected and stored">
        <ul className="list-disc space-y-2 pl-5">
          <li>Spotify’s immutable account identifier and current Spotify user identifier.</li>
          <li>Spotify access and refresh tokens, encrypted before database storage.</li>
          <li>
            The scopes granted, access-token expiry, authorization time, and connection status.
          </li>
          <li>
            A random browser session identifier. Only its SHA-256 hash is stored in the database.
          </li>
        </ul>
        <p>
          Spotified fetches profile details, affinity-ranked top artists and tracks, recently played
          tracks, saved tracks, playlist metadata, permitted playlist items, manual search results,
          and current SDK playback state when needed for a private page or player. It does not build
          a permanent Spotify listening-history or catalog database from those responses. The
          documented SDK grant includes email access, but Spotified does not read, store, display,
          or use your Spotify email address.
        </p>
      </LegalSection>

      <LegalSection title="How data is used">
        <p>
          The data is used only to authenticate you, refresh the Spotify connection, display the
          account views you request, and stream or control songs you explicitly choose through
          Spotify’s official Web Playback SDK. Spotified does not sell data, use it for advertising,
          email Spotify users, train AI models, or calculate an app-generated taste profile.
        </p>
        <p>
          When an authenticated private page opens, the browser connects the SDK as a Spotify
          Connect device. The SDK receives a current, short-lived access token from an
          authenticated, uncached Spotified endpoint. That token is used in memory and is not placed
          in a URL, browser storage, application logs, or the page’s rendered content. Refresh
          tokens and the Spotify client secret remain server-side.
        </p>
      </LegalSection>

      <LegalSection title="Service providers and international processing">
        <p>
          The application is designed to run on Vercel and store its small authentication database
          in Supabase PostgreSQL. Those providers process data as infrastructure providers under
          their own terms and configured deployment regions. Spotify processes the OAuth flow, API
          requests, SDK device connection, and audio streaming under Spotify’s own terms and privacy
          policy.
        </p>
      </LegalSection>

      <LegalSection title="Cookies and similar storage">
        <p>
          Spotified uses two strictly necessary, HTTP-only cookies: a short-lived OAuth state cookie
          that protects the connection callback, and an expiring session cookie that keeps this
          browser signed in. No advertising or product-analytics cookies are configured by this
          application. Spotify may use its own cookies when you leave Spotified for Spotify’s
          authorization pages.
        </p>
      </LegalSection>

      <LegalSection title="Retention and deletion">
        <p>
          The connection and session records remain only while needed to operate your private
          account. In Settings, “Disconnect and delete” removes the local user, encrypted Spotify
          tokens, and all sessions. Signing out removes only the current browser session. To revoke
          Spotify’s provider-side grant as well, follow the Spotify Manage Apps instructions linked
          from Settings.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You may decline the Spotify connection, cancel Spotify authorization, avoid starting
          playback, sign out, reconnect, or disconnect and delete local data at any time. Full song
          playback is available only to qualifying Spotify Premium accounts. Contact {contact} with
          access, correction, restriction, deletion, or privacy questions.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          This notice must be updated when the application changes what it collects, introduces
          another data provider, or changes infrastructure. Material changes should be shown before
          users reconnect.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
