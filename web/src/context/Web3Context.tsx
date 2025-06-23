'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import type { MetaMaskInpageProvider } from '@metamask/providers';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

type Role = 'admin' | 'client';

interface Web3ContextType {
    account: string | null;
    provider: ethers.BrowserProvider | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    isConnected: boolean;
    role: Role;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// Replace this with your actual admin address (can be loaded from env or contract later)
// This is first anvil account
const ADMIN_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase();

export function Web3Provider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [role, setRole] = useState<Role>('client');
    const router = useRouter();

    const connect = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send('eth_requestAccounts', []);
                const connectedAccount = accounts[0];
                setAccount(connectedAccount);
                setProvider(provider);

                const normalized = connectedAccount.toLowerCase();
                setRole(normalized === ADMIN_ADDRESS ? 'admin' : 'client');
            } catch (error) {
                console.error('Error connecting to MetaMask', error);
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    const disconnect = useCallback(() => {
        setAccount(null);
        setProvider(null);
        setRole('client');
        router.push('/')
    }, [router]);

    useEffect(() => {
        const savedAccount = localStorage.getItem('web3Account');
        if (savedAccount && window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);
            setAccount(savedAccount);
            const normalized = savedAccount.toLowerCase();
            setRole(normalized === ADMIN_ADDRESS ? 'admin' : 'client');
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
          if (!window.ethereum) return;
        
          const handleAccountsChanged = (...args: unknown[]) => {
            if (!Array.isArray(args[0])) return;
            const accounts = args[0] as string[] | undefined;
            const newAccount = accounts?.[0] || null;

            if (!newAccount || newAccount.toLowerCase() !== account?.toLowerCase()) {
                console.log('Redirecting home...', newAccount);
                disconnect(); // this already resets account, provider, role, and redirects
            } else {
                // If same account (e.g., MetaMask reconnects), still ensure role is updated
                const normalized = newAccount.toLowerCase();
                setRole(normalized === ADMIN_ADDRESS ? 'admin' : 'client');
            }
          };
        
          window.ethereum.on('accountsChanged', handleAccountsChanged);
        
          return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
          };
    }, [disconnect]);

    return (
        <Web3Context.Provider value={{ account, provider, connect, disconnect, isConnected: !!account, role }}>
        {children}
        </Web3Context.Provider>
    );
}

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
    return context;
};
