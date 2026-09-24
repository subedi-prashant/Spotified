const SPOTIFY_SDK_URL = "https://sdk.scdn.co/spotify-player.js";
const SDK_LOAD_TIMEOUT_MILLISECONDS = 15_000;

let spotifySdkPromise: Promise<ISpotifySdk> | null = null;

export function LoadSpotifySdk(): Promise<ISpotifySdk> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Spotify playback is only available in a browser."));
  }

  if (window.Spotify) {
    return Promise.resolve(window.Spotify);
  }

  if (spotifySdkPromise) {
    return spotifySdkPromise;
  }

  spotifySdkPromise = new Promise<ISpotifySdk>((resolve, reject) => {
    const previousReadyHandler = window.onSpotifyWebPlaybackSDKReady;
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SPOTIFY_SDK_URL}"]`);
    let settled = false;

    const timeout = window.setTimeout(() => {
      Fail(new Error("Spotify playback took too long to load."));
    }, SDK_LOAD_TIMEOUT_MILLISECONDS);

    function Finish(): void {
      if (settled || !window.Spotify) {
        return;
      }

      settled = true;
      window.clearTimeout(timeout);
      resolve(window.Spotify);
    }

    function Fail(error: Error): void {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeout);
      script?.remove();
      reject(error);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      previousReadyHandler?.();
      Finish();
    };

    if (!script) {
      script = document.createElement("script");
      script.src = SPOTIFY_SDK_URL;
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener("load", Finish, { once: true });
    script.addEventListener("error", () => Fail(new Error("Spotify playback could not load.")), {
      once: true,
    });
  });

  void spotifySdkPromise.catch(() => {
    spotifySdkPromise = null;
  });

  return spotifySdkPromise;
}
