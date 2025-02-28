// src/app/layout.tsx (Server Component by default)
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Chatbot",
  description: "A Next.js + NextAuth + Prisma + PostgreSQL setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
