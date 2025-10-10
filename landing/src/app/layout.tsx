import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsFlow - WhatsApp Business Platform",
  description: "Powerful WhatsApp Business messaging platform with AI, automation, and analytics",
  keywords: ["WhatsApp", "Business", "Messaging", "Automation", "AI", "CRM"],
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


