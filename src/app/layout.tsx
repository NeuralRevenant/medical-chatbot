// src/app/layout.tsx
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata = {
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
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
