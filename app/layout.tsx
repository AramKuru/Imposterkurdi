import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ئیمپۆستەر - یاری کوردی",
  description: "یاری ئیمپۆستەر بە زمانی کوردی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" dir="rtl" className="h-full">
      <body
        className="min-h-full flex flex-col"
        style={{ background: "#0f0a1e", color: "#f0e6ff" }}
      >
        {children}
      </body>
    </html>
  );
}
