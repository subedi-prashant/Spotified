import { SpotifyApiError, SpotifyResponseValidationError } from "@/lib/spotify/client";
import {
  SpotifyAccountNotFoundError,
  SpotifyReconnectRequiredError,
} from "@/server/services/spotify-token-service";

export type SpotifyPageError = {
  title: string;
  description: string;
  action: "retry" | "reconnect" | "none";
};

export function GetSpotifyPageError(error: unknown): SpotifyPageError {
  if (
    error instanceof SpotifyReconnectRequiredError ||
    error instanceof SpotifyAccountNotFoundError
  ) {
    return {
      title: "Your Spotify connection needs attention",
      description: "Reconnect your account to securely continue.",
      action: "reconnect",
    };
  }

  if (error instanceof SpotifyApiError && error.status === 403) {
    return {
      title: "This account is not available to the app",
      description:
        "Ask the app owner to add this Spotify account to the Development Mode allowlist.",
      action: "none",
    };
  }

  if (error instanceof SpotifyApiError && error.status === 429) {
    return {
      title: "Spotify is asking us to slow down",
      description:
        error.reason === "QUOTA_EXCEEDED"
          ? "The development quota is currently exhausted. Try again later."
          : `Try again${error.retryAfterSeconds ? ` in about ${error.retryAfterSeconds} seconds` : " shortly"}.`,
      action: "retry",
    };
  }

  if (error instanceof SpotifyResponseValidationError) {
    return {
      title: "Spotify returned something unexpected",
      description: "No incorrect data was shown. Try again after Spotify's response stabilizes.",
      action: "retry",
    };
  }

  return {
    title: "Spotify is temporarily unavailable",
    description: "Your account data is safe. Refresh this page to try again.",
    action: "retry",
  };
}
