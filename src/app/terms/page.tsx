import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  const contact =
    process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL ??
    "the app owner who invited you to this private beta";

  return (
    <LegalPage
      title="End-user terms"
      description="The rules for using this private beta and the provider-specific limits that Spotified must respect."
    >
      <LegalSection title="Private beta">
        <p>
          Spotified is an independent, private, non-commercial personal project for Spotify accounts
          approved on the app owner’s Development Mode allowlist. It is not endorsed, sponsored, or
          operated by Spotify. Do not use it for commercial, business, public-performance, or
          unlawful purposes.
        </p>
      </LegalSection>

      <LegalSection title="Spotify platform and content">
        <p>
          Your Spotify use remains subject to Spotify’s terms. You must not copy, download, scrape,
          alter, redistribute, or create derivative works from the Spotify Platform, Spotify
          Service, or Spotify Content through Spotified. You must not decompile, reverse-engineer,
          disassemble, or otherwise reduce those services or content to source code or another
          human-perceivable form except where applicable law expressly prevents that restriction.
        </p>
      </LegalSection>

      <LegalSection title="What the app does">
        <p>
          Spotified displays limited account information returned by Spotify and lets qualifying
          Premium users stream songs through Spotify’s official Web Playback SDK. Spotify-provided
          top items are affinity rankings, not play counts. Recently played records are not a
          complete listening history. The app does not promise listening-time analytics, a taste
          profile, recommendations, continuous availability, or permanent access to any endpoint.
        </p>
      </LegalSection>

      <LegalSection title="Playback rules">
        <p>
          Full song playback requires a qualifying Spotify Premium subscription and an explicit user
          action. Playback is for private, personal listening only. You must not record, download,
          alter, mix, synchronize, rebroadcast, publicly perform, or commercially use Spotify audio
          through Spotified. Spotify may restrict content, devices, controls, territories, or
          account eligibility at any time.
        </p>
      </LegalSection>

      <LegalSection title="No warranties from Spotify">
        <p>
          Spotified makes no warranty or representation on behalf of Spotify. To the fullest extent
          permitted by law, all implied warranties regarding the Spotify Platform, Spotify Service,
          and Spotify Content—including merchantability, fitness for a particular purpose, and
          non-infringement—are disclaimed.
        </p>
      </LegalSection>

      <LegalSection title="Responsibility and liability">
        <p>
          The Spotified project owner, not Spotify, is responsible for this application. Spotify and
          other third parties are not liable for Spotified, its operation, or its handling of data.
          The private beta is provided as-is and may be changed, suspended, or discontinued when
          provider policies, quotas, or infrastructure require it.
        </p>
      </LegalSection>

      <LegalSection title="Data and account control">
        <p>
          You authorize the requested account-read and playback-control scopes when you approve
          Spotify’s consent screen. You may sign out or disconnect at any time. Disconnecting
          deletes the local records described in the privacy notice; remotely revoking Spotify
          access is a separate action in Spotify’s Manage Apps controls.
        </p>
      </LegalSection>

      <LegalSection title="Spotify as beneficiary">
        <p>
          Spotify is a third-party beneficiary of these terms and the privacy notice and is entitled
          to enforce the provisions relating to the Spotify Platform, Spotify Service, Spotify
          Content, and Spotify’s rights directly.
        </p>
      </LegalSection>

      <LegalSection title="Contact and changes">
        <p>
          Contact {contact} with questions. The owner may update these terms when the app or
          provider requirements change. Continued use after notice of an update means accepting the
          revised terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
