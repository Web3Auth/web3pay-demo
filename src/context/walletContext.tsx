"use client";

// WalletContext.js
import { WalletProvider } from '@web3auth/global-accounts-sdk';
import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext({
    address: "",
    setAddress: (address: string) => {},
    walletProvider: null as any,
    setWalletProvider: (provider: any) => {},
    loggedIn: false,
    setLoggedIn: (loggedIn: boolean) => {},
});

export const WalletProviderContext = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState("");
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <WalletContext.Provider
      value={{
        address,
        setAddress,
        walletProvider,
        setWalletProvider,
        loggedIn,
        setLoggedIn,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};
