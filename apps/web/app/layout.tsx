import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { IAMProvider } from "@/src/features/auth/components/IAMProvider";

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
    <html lang="en">
      <body className={inter.className}>
        <IAMProvider>{children}</IAMProvider>
      </body>
    </html>
  );
}
