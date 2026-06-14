import type { Metadata, Viewport } from "next";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import PreferencesProvider from "@/components/PreferencesProvider";

export const metadata: Metadata = {
  title: "DocSaathi — AI Legal Document Simplifier",
  description: "Understand any legal document in your own language. Upload rental agreements, NDAs, or employment contracts and get a plain language breakdown of risky clauses.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DocSaathi",
  },
  other: {
    "mobile-web-app-capable": "yes",
  }
};

export const viewport: Viewport = {
  themeColor: "#cc785c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <PreferencesProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
