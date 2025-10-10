import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsFlow Admin - Master Control Panel",
  description: "Administrative panel for WhatsFlow platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}


