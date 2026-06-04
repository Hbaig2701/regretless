import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Regretless",
  description: "Stop hoarding possibilities and go live.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF7F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#FAF7F2", minHeight: "100dvh", paddingBottom: "5rem" }}>
        <main style={{ maxWidth: "430px", margin: "0 auto", padding: "1.5rem 1.25rem" }}>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
