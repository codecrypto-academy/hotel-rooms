import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";

export const metadata: Metadata = {
  title: "Hotel California NFT",
  description: "Blockchain-based luxury hotel reservations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3Provider>
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-800">
        {/*
          <Header /> 
        */}
        {children}
      </body>
    </html>
    </Web3Provider>
  );
}
