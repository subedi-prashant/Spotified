import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inconsolata } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-press-display",
  display: "swap",
});

const detailFont = Inconsolata({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-press-detail",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spotified",
    template: "%s · Spotified",
  },
  description: "A focused, private Spotify companion with Premium web playback.",
  applicationName: "Spotified",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: "#090a0f",
};

const themeInitScript = `try{var r=document.documentElement,v=localStorage.getItem("spotified-visual-theme");if(v==="redesign"){r.classList.replace("classic","redesign");var m=localStorage.getItem("spotified-theme");if(m==="dark"||(m!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))r.classList.add("dark")}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`classic ${displayFont.variable} ${detailFont.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
