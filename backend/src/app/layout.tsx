import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Silent Help API",
  description: "Silent Help Backend API Server",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
