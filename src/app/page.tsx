/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@/context/walletContext";
import { Modal } from "@/components/ui/Modal";
import ErrorPopup from "@/components/ErrorPopup";
import Navbar from "@/components/ui/Navbar";
import Web3Pay from "@/components/Web3Pay";

export default function Home() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const { setAddress, walletProvider, setLoggedIn, loggedIn } = useWallet();
  // error message
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");
  const [errorRetryFunction, setErrorRetryFunction] = useState<
    () => Promise<void>
  >(() => Promise.resolve());
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);

  async function loginOrRegister() {
    setIsLoading(true);
    setDisplayErrorPopup(false);
    try {
      const response = await walletProvider?.request({
        method: "eth_requestAccounts",
        params: [],
      });
      const loggedInAddress = (response as string[])[0];
      setAddress(loggedInAddress);
      setLoggedIn(walletProvider?.connected || false);
      // addLog(`Success full login: ${response}`);
    } catch (err: any) {
      console.log(`Error during login: ${JSON.stringify(err)}`);
      setErrorText("Error while creating Web3Pay account");
      setSubErrorText(err?.message || "");
      setErrorRetryFunction(() => loginOrRegister);
      setDisplayErrorPopup(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (walletProvider?.connected && loggedIn) {
      router.push("/home");
    }
  }, [walletProvider, loggedIn, router]);

  return (
    <main className="flex flex-col">
      <Navbar address={""} showButton={false} />
      <Web3Pay actionButtonText="Create Testnet Web3Pay Account" onActionButtonClick={loginOrRegister} isLoading={isLoading} />

      <Modal
        isOpen={displayErrorPopup}
        onClose={() => setDisplayErrorPopup(false)}
      >
        <ErrorPopup
          handleTryAgain={() => errorRetryFunction()}
          subText={subErrorText}
          text={errorText}
        />
      </Modal>
    </main>
  );
}
