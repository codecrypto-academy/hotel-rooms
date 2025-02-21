"use client";

import { useWeb3 } from "@/context/Web3Context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Header() {
  const { connect, account, isConnected } = useWeb3();
  const router = useRouter();

  const handleConnect = async () => {
    await connect();
    router.push("/dashboard");
  };

  const handleGoDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <header className="w-full bg-white/80 border-b border-gray-100 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleGoHome}
        >
          {/* Replace /images/logo.png with your actual path */}
          <img
            src="/images/logo.png"
            alt="Hotel California Logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <h1 className="text-xl font-bold tracking-wide text-gray-800">
            Hotel California NFT
          </h1>
        </div>

        {/* Right side: Connect Wallet or Show Address + Dashboard Button */}
        {isConnected ? (
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-gray-600">
              Conectado: <strong>{account?.slice(0, 6)}...{account?.slice(-4)}</strong>
            </span>
            <Button
              onClick={handleGoDashboard}
              className="bg-gold hover:bg-goldHover text-white px-5 py-2 rounded-md font-medium transition"
            >
              Ir al Dashboard
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            className="bg-gold hover:bg-goldHover text-white px-5 py-2 rounded-md font-medium transition"
          >
            Conectar Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
