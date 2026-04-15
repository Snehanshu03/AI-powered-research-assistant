import "./globals.css";

export const metadata = {
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
      <body className="font-sans">{children}</body>
    </html>
  );
}