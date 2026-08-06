import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "vispeech - ฝึกออกเสียงภาษาไทย",
  description: "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด Real-time lip tracking + Thai speech recognition",
  openGraph: {
    title: "vispeech - ฝึกออกเสียงภาษาไทย",
    description: "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด Real-time lip tracking + Thai speech recognition",
    locale: "th_TH",
    type: "website",
    siteName: "vispeech",
  },
  twitter: {
    card: "summary_large_image",
    title: "vispeech - ฝึกออกเสียงภาษาไทย",
    description: "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366F1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
