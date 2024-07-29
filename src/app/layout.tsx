import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";

const inter = DM_Sans({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Web3Auth | Global Account Demo",
  description:
    "Global Account Demo is a simple example of how to use Web3Auth to create a global account system.",
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
