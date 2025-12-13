import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import LogoutButton from "@/components/LogoutButton"; // <-- add this

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HyperVC",
  description: "AI-powered startup pitch analyzer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          margin: 0,
          background: "linear-gradient(180deg, #f0f9ff 0%, #ecfeff 35%, #f5f3ff 100%)",
          minHeight: "100dvh",
        }}
      >
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 20px",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: "#111827", textDecoration: "none" }}>
              HyperVC
            </Link>
            <Link href="/analyze" style={{ fontWeight: 500, color: "#2563eb", textDecoration: "none" }}>
              Analyze
            </Link>
          </div>

          {/* Client component handles onClick */}
          <LogoutButton />
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}