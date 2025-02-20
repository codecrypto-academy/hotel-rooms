'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  connect: () => Promise<void>;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAccount(accounts[0]);
        setProvider(provider);
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };


  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  }
  useEffect(() => {
    const savedAccount = localStorage.getItem('web3Account');
    if (savedAccount && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      setProvider(provider);
      setAccount(savedAccount);
    }
  }, []);

  useEffect(() => {
    if (account) {
      localStorage.setItem('web3Account', account);
    } else {
      localStorage.removeItem('web3Account');
    }
  }, [account]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }
  },[]);

  return (
    <Web3Context.Provider value={{ account, provider, connect, isConnected: !!account }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
}; 
