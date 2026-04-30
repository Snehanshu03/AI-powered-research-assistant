import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Research Assistant",
  description: "Chat with research papers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}