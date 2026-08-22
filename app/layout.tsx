import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "RentGuard AI — Property Evidence Intelligence",
    template: "%s · RentGuard AI",
  },
  description:
    "Move-in/move-out property inspection dossier, automated damage valuation ledger, and ML-15 tenancy retention scoring for Indian residential leases.",
  keywords: ["rental", "tenant", "damage audit", "property inspection", "forensic ledger", "INR valuation", "ML churn"],
  openGraph: {
    title: "RentGuard AI — Forensic Inspection Dossier",
    description: "Property move-in/move-out inspection, evidence comparison, and ML churn audit tool",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
