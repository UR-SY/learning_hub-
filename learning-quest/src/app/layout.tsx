import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { StoreInitializer } from "@/components/store-initializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learning Quest",
  description: "Gamified Personal Learning Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex min-h-screen bg-background text-foreground`}>
        <StoreInitializer />
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
