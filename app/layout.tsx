import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GARUDASENA | Ganesh Chaturthi 2026",
  description: "GARUDASENA — a celebration of faith, community, and new beginnings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
