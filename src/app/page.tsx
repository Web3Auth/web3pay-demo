/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import Card from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WalletProvider } from "@web3auth/global-accounts-sdk";
import { calculateBaseUrl } from "@/utils/utils";
import { SelectedEnv } from "@/utils/interfaces";
import { useWallet } from "@/context/walletContext";
import { Modal } from "@/components/ui/Modal";
import ErrorPopup from "@/components/ErrorPopup";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    setAddress,
    walletProvider,
    setLoggedIn,
    setWalletProvider,
    loggedIn,
  } = useWallet();
  const [chainId, setChainId] = useState(80002);
  const [selectedEnv, setSelectedEnv] = useState<SelectedEnv>("local");
  // error message
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");
  const [errorRetryFunction, setErrorRetryFunction] = useState<
    () => Promise<void>
  >(() => Promise.resolve());
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);

  useEffect(() => {
    const getWalletURL = () => {
      return `${calculateBaseUrl(selectedEnv)}/connect`;
    };

    // initiate sdk
    const initWalletProvider = async () => {
      setIsLoading(true);
      setWalletProvider(
        new WalletProvider({
          metadata: {
            appChainIds: [chainId],
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
    initWalletProvider();

    // check if user is already logged in
    const getAddress = async () => {
      try {
        setLoggedIn(walletProvider?.connected || loggedIn);
        const account = (await walletProvider?.request({
          method: "eth_accounts",
          params: [],
        })) as string[];
        if (account?.length) {
          setAddress(account[0]);
          router.push("/home");
        }
      } catch (err) {
        console.log(err);
        setAddress("");
      }
    };
    getAddress();
  }, [walletProvider?.connected, selectedEnv]);

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
      setErrorText("Error while creating global pay account");
      setSubErrorText(err?.message || "");
      setErrorRetryFunction(() => loginOrRegister);
      setDisplayErrorPopup(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex flex-col">
      <section className="lg:h-dvh bg-blend-lighten lg:bg-home bg-no-repeat bg-auto bg-scroll bg-[100%] flex-grow px-6 py-10 md:p-9 md:pb-20 flex flex-col gap-y-10 md:gap-y-20">
        <div className="flex flex-col text-left gap-y-6 lg:pl-16 mt-2.5">
          <div className="text-left text-3xl sm:banner-heading-text flex flex-col gap-y-1">
            <p>Abstract everything, </p>
            <p>everywhere, all at once,</p>
            <div className="flex flex-col items-start gap-y-6">
              <p className="gradient-text">with Web3Pay</p>
              <Button
                handleClick={loginOrRegister}
                title="Create Testnet Web3Pay Account"
                icon={<HiOutlineArrowSmRight className="text-white text-xl" />}
                otherClasses="tracking-normal"
                loading={isLoading}
              />
            </div>
          </div>
        </div>
        <Image
          src="/images/demo-home-bg.svg"
          alt="bg"
          height={200}
          width={100}
          className="w-full lg:hidden"
        />
        <div className="flex flex-col text-left gap-y-4 max-lg:mx-auto lg:pl-16 lg:mt-auto">
          <Image
            src="/images/stroke-divider.svg"
            alt="stroke"
            height={50}
            width={280}
          />
          <div className="text-base font-normal text-gray-400 uppercase">
            <p>EXPERIENCE HOW WEB3PAY CAN </p>
            <p>UNIFY A FRAGMENTED ECOSYSTEM</p>
          </div>
          <Image
            src="/images/stroke-divider.svg"
            alt="stroke"
            height={50}
            width={280}
          />
        </div>
      </section>
      <section className="lg:h-dvh flex flex-col gap-y-10 md:gap-y-20 py-10 md:py-20">
        <p className="text-center text-32 lg:text-5xl text-white">
          Web3Pay for Users
        </p>
        <div className="flex flex-col lg:flex-row items-center gap-y-6 lg:gap-x-10">
          <Image
            src="/images/web3pay-user.svg"
            alt="Web3PayUser"
            height={500}
            width={600}
            className="w-full lg:w-[40%]"
          />
          <div className="flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 lg:w-[60%] p-6 md:p-10 lg:pr-16">
            <div className="text-left flex flex-col gap-y-2">
              <p className="text-xl md:text-32 text-white break-words">
                Connect up Multiple Wallets & Assets in One Account
              </p>
              <p className="text-base md:text-2xl font-normal text-gray-400">
                Utilize tokens across any wallet and chain, eliminating the
                complexities of bridging assets.{" "}
              </p>
            </div>
            <div className="gradient-divider"> </div>
            <div className="text-left flex flex-col gap-y-2">
              <p className="text-xl md:text-32 text-white break-words">
                Utilize tokens across any wallet and chain
              </p>
              <p className="text-base md:text-2xl font-normal text-gray-400">
                Utilize tokens across any wallet and chain, eliminating the
                complexities of bridging assets.
              </p>
            </div>
            <div className="gradient-divider"> </div>
            <div className="text-left flex flex-col gap-y-2">
              <p className="text-xl md:text-32 text-white break-words">
                Unlock the potential of cross-chain transactions
              </p>
              <p className="text-base md:text-2xl font-normal text-gray-400">
                Utilize tokens across any wallet and chain, eliminating the
                complexities of bridging assets.{" "}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="lg:h-dvh flex flex-col py-10 md:py-20">
        <p className="text-base md:text-2xl font-bold uppercase text-gray-400 text-center md:text-left mb-4 px-6 md:px-20">
          SERVICES
        </p>
        <p className="text-center md:text-left text-32 md:text-5xl text-white mb-4 px-4 md:px-20">
          Web3Pay for Developers
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-x-6 items-stretch justify-center w-full p-6 md:px-20 md:py-10">
          <Card
            cardClasses="flex flex-col items-start p-9 w-auto"
            rootClasses="!w-auto"
            active
          >
            <Image
              src="/icons/thunder.svg"
              alt="Service 1"
              height={45}
              width={45}
            />
            <p className="text-[32px] break-words text-left leading-9 text-white font-bold mt-10 mb-6">
              Boost engagement for your applications
            </p>
            <p className="text-2xl font-normal text-gray-400 text-left">
              Keeping user activities within the dApp/wallet so that your users
              can focus on what truly matters
            </p>
          </Card>
          <Card
            cardClasses="flex flex-col items-start p-9 w-auto"
            rootClasses="!w-auto"
            active
          >
            <Image
              src="/icons/finger-print.svg"
              alt="Service 1"
              height={45}
              width={45}
            />
            <p className="text-[32px] break-words text-left leading-9 text-white font-bold mt-10 mb-6">
              An authentication experience that works
            </p>
            <p className="text-2xl font-normal text-gray-400 text-left">
              Passkeys provides your users a more secure login method, doing
              away with passwords
            </p>
          </Card>
          <Card
            cardClasses="flex flex-col items-start p-9 w-auto"
            rootClasses="!w-auto"
            active
          >
            <Image
              src="/icons/link.svg"
              alt="Service 1"
              height={45}
              width={45}
            />
            <p className="text-[32px] break-words text-left leading-9 text-white font-bold mt-10 mb-6">
              Infrastructure that is designed to support all chains and assets.
            </p>
            <p className="text-2xl font-normal text-gray-400 text-left">
              Enhancing your user’s experience by simplifying interactions on
              multiple chains
            </p>
          </Card>
        </div>
        <footer className="p-6 lg:p-20 flex items-center justify-center">
          <Image
            src="https://images.web3auth.io/ws-trademark-dark.svg"
            alt="footer"
            height={50}
            width={200}
          />
        </footer>
      </section>
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
