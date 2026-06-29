import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { IAMProvider } from "../features/auth/components/IAMProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechAxon Frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Add suppressHydrationWarning here
    <html lang="en" suppressHydrationWarning>
      {/* 2. Add it here too just in case extensions inject into the body */}
      <body className={inter.className} suppressHydrationWarning>
        <IAMProvider>{children}</IAMProvider>
      </body>
    </html>
  );
}
