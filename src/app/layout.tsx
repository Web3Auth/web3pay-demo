import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { WalletProviderContext } from "@/context/walletContext";
import ZustandProvider from "@/components/ZustandProvider";

const inter = DM_Sans({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Web3Pay | Web3Auth",
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
      <body className={`${inter.className} relative`}>
        <ZustandProvider>
          <WalletProviderContext >
            {children}
          </WalletProviderContext>
        </ZustandProvider>
      </body>
    </html>
  );
}
