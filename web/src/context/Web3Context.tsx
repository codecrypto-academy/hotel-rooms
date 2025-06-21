'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum: any;
    }
}

type Role = 'admin' | 'client';

interface Web3ContextType {
    account: string | null;
    provider: ethers.BrowserProvider | null;
    connect: () => Promise<void>;
    isConnected: boolean;
    role: Role;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// Replace this with your actual admin address (can be loaded from env or contract later)
const ADMIN_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase();

export function Web3Provider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [role, setRole] = useState<Role>('client');

    const connect = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum as any);
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

    const disconnect = () => {
        setAccount(null);
        setProvider(null);
        setRole('client');
    };

    useEffect(() => {
        const savedAccount = localStorage.getItem('web3Account');
        if (savedAccount && window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum as any);
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
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                const newAccount = accounts[0] || null;
                setAccount(newAccount);
                const normalized = newAccount?.toLowerCase();
                setRole(normalized === ADMIN_ADDRESS ? 'admin' : 'client');
            });
        }
    }, []);

    return (
        <Web3Context.Provider value={{ account, provider, connect, isConnected: !!account, role }}>
        {children}
        </Web3Context.Provider>
    );
}

export const useWeb3 = () => {
    const context = useContext(Web3Context);
    if (!context) throw new Error('useWeb3 must be used within a Web3Provider');
    return context;
};
