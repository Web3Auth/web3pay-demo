"use client";

import Banner from "@/components/Banner";
import Steps from "@/components/Steps";
import Navbar from "@/components/ui/Navbar";
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { useEffect, useState } from "react";

export default function Home() {
  const [walletProvider, setWalletProvider] = useState<WalletProvider>();
  const [loggedIn, setLoggedIn] = useState(walletProvider?.connected || false);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isLocal = window.location.hostname.startsWith("localhost");
  const [selectedEnv, setSelectedEnv] = useState(isLocal ? "local" : "prod");

  useEffect(() => {
    const getWalletURL = () => {
      if (selectedEnv === "local") {
        return "https://lrc-accounts.web3auth.io/connect";
      } else {
        return "http://localhost:3000/connect";
      }
    };

    const init = async () => {
      setIsLoading(true);
      setWalletProvider(
        new WalletProvider({
          metadata: {
            appChainIds: [11155111],
            appName: "Demo App",
            appLogoUrl: "https://web3auth.io/images/web3authlog.png",
          },
          preference: {
            keysUrl: getWalletURL(),
          },
        })
      );
      setIsLoading(false);
      setLoggedIn(walletProvider?.connected || false);
    };
    init();
  }, [walletProvider?.connected, selectedEnv]);

  async function loginOrRegister() {
    try {
      setIsLoading(true);
      const response = await walletProvider?.request({
        method: "eth_requestAccounts",
        params: [],
      });
      setAddress((response as string[])[0]);
      console.log({ response });
      setLoggedIn(walletProvider?.connected || false);
      // addLog(`Success full login: ${response}`);
    } catch (err) {
      // addLog(`Error during login: ${JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="p-6">
      <Navbar handleConnect={loginOrRegister} loader={isLoading} />
      <Banner />
      <Steps />
    </main>
  );
}
