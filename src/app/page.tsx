/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@/context/walletContext";
import { Modal } from "@/components/ui/Modal";
import ErrorPopup from "@/components/ErrorPopup";
import Navbar from "@/components/ui/Navbar";
import Web3Pay from "@/components/Web3Pay";
import { parseSdkError } from "@/utils/utils";

export default function Home() {
  const router = useRouter();
  const { setAddress, walletProvider, setLoggedIn, showNextLoginModal, setShowNextLoginModal } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  // error message
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");
  const [errorRetryFunction, setErrorRetryFunction] = useState<
    () => Promise<void>
  >(() => Promise.resolve());
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);

  async function loginOrRegister(loginParams?: { showLoggedOutModal?: boolean }) {
    setIsLoading(true);
    setDisplayErrorPopup(false);
    try {
      const response = await walletProvider?.connect(loginParams);
      const loggedInAddress = (response as string[])[0];
      setAddress(loggedInAddress);
      setLoggedIn(walletProvider?.connected || false);
      // addLog(`Success full login: ${response}`);
    } catch (err: any) {
      const error = parseSdkError(err, "Error while creating Web3Pay account");
      if (error.code === 4001) {
        // user cancelled the login request
        setIsLoading(false);
        return;
      }
      console.log(`Error during login: ${JSON.stringify(err)}`);
      setErrorText(error.errorText);
      setSubErrorText(error.subErrorText);
      setErrorRetryFunction(() => loginOrRegister);
      setDisplayErrorPopup(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (walletProvider?.connected) {
      router.push("/home");
    }
  }, [walletProvider, router]);

  useEffect(() => {
    if (showNextLoginModal) {
      setShowNextLoginModal(false);
      (async () => {
        await loginOrRegister({ showLoggedOutModal: showNextLoginModal });
      })()
    }
  }, [showNextLoginModal]);

  return (
    <main className="flex flex-col">
      <Navbar address={""} showButton={false} />
      <Web3Pay actionButtonText="Create Testnet Web3Pay Account" onActionButtonClick={() => loginOrRegister()} isLoading={isLoading} />

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
