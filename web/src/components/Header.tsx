'use client';

import { useWeb3 } from '@/context/Web3Context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function Header() {
  const { connect, account, isConnected } = useWeb3();
  const router = useRouter();

  const handleConnect = async () => {
    await connect();
    if (isConnected) {
      router.push('/dashboard');
    }
  };

  return (
    <header className="w-full p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hotel California NFT</h1>
        <Button onClick={handleConnect}>
          {isConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Conectar Wallet'}
        </Button>
      </div>
    </header>
  );
} 