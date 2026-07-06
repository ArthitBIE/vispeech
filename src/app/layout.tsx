import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vispeech - ฝึกออกเสียงภาษาไทย",
  description: "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด",
  openGraph: {
    title: "vispeech - ฝึกออกเสียงภาษาไทย",
    description: "ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด",
    locale: "th_TH",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
