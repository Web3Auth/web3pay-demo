import React, { useState } from "react";
import ImportFlowCard from "./ui/ImportFlowCard";
import { ConnectWeb3PayStep, IRandomWallet, SelectedEnv } from "@/utils/interfaces";
import { openInNewTab, sliceAddress } from "@/utils";
import Image from "next/image";
import Card from "./ui/Card";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import GradientButton from "./ui/GradientButton";
import Button from "./ui/Button";
import { calculateBaseUrl, cn } from "@/utils/utils";
import Link from "next/link";
import Faq from "./ui/Faq";
import Footer from "./Footer";
import NewsLetter from "./NewsLetter";
import Navbar from "./ui/Navbar";
import { generatePrivate, getPublic } from "@toruslabs/eccrypto";
import { privateKeyToAddress } from "viem/accounts";
import { createClient, createPublicClient, encodeFunctionData, Hex, http } from "viem";
import { Modal } from "./ui/Modal";
import ErrorPopup from "./ErrorPopup";
import { waitForTransactionReceipt } from "viem/actions";
import axios from "axios";
import { arbitrumSepolia, polygonAmoy } from "viem/chains";
import { OpenloginSessionManager } from "@toruslabs/session-manager";
import { useWallet } from "@/context/walletContext";
import { erc721Abi } from "@/utils/abis/erc721";
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from "permissionless";

const STEPS = {
  CONNECT: "Connect",
  CROSS_CHAIN_MINTING: "Cross_Chain_Minting",
  VIEW_SUMMARY: "View_Summary",
};

const Home = ({ address }: { address: string }) => {
  const [activeStep, setActiveStep] = useState(STEPS.CONNECT);
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");
  const [errorRetryFunction, setErrorRetryFunction] = useState<
    () => Promise<void>
  >(() => Promise.resolve());


  return (
    <>
      <Navbar
        address={address}
        containerClass="bg-transparent"
        logoText={activeStep === STEPS.VIEW_SUMMARY ? "About Web3Pay" : ""}
      />
      <section
        className={cn(
          "flex-grow flex flex-col items-center justify-center relative z-1 bg-darkCard py-11 px-9 w-full",
          {
            "h-dvh": activeStep !== STEPS.VIEW_SUMMARY,
          }
        )}
      >
        <Image
          src={"/images/cross-chain-gradient.png"}
          alt="cross chain"
          width={500}
          height={500}
          className="z-0 w-full h-full opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="mt-16 flex flex-col gap-y-16 md:gap-y-20">
          {activeStep === STEPS.VIEW_SUMMARY && (
            <div className="text-center">
              <p className="text-32 sm:banner-heading-text blue-gradient-text">
                Web3Pay Demo
              </p>
              <p className="text-base md:text-2xl font-normal text-white w-full md:w-[60%] mx-auto mt-6">
                Here’s what you experienced when leveraging your EOA’s token
                liquidity for cross-chain transactions without gas fees or
                bridges
              </p>
            </div>
          )}
          {activeStep === STEPS.CONNECT  && (
            <ConnectStep 
              onError={(err) => {
                setSubErrorText(err);
                setDisplayErrorPopup(true);
              }}
              onSuccess={() => {
                setSubErrorText("");
                setDisplayErrorPopup(false);
                setActiveStep(STEPS.CROSS_CHAIN_MINTING);
              }}    
              showSummary={activeStep === STEPS.VIEW_SUMMARY}
              setErrorRetryFunction={(x)=> {
                setSubErrorText("");
                setDisplayErrorPopup(false);
                setErrorRetryFunction(x)
              }}
              />
          )}
          {(activeStep === STEPS.CROSS_CHAIN_MINTING ||
            activeStep === STEPS.VIEW_SUMMARY) && (
            <CrossMintingStep 
              onSuccess={() => {
                setSubErrorText("");
                setDisplayErrorPopup(false);
                setActiveStep(STEPS.VIEW_SUMMARY);
              }}  
              onError={(err) => {
                setSubErrorText(err);
                setDisplayErrorPopup(true);
              }} 
              setErrorRetryFunction={(x)=> {
                setSubErrorText("");
                setDisplayErrorPopup(false);
                setErrorRetryFunction(x)
              }}
              showSummary={activeStep === STEPS.VIEW_SUMMARY} />
          )}
          {activeStep === STEPS.VIEW_SUMMARY && (
            <div className="flex flex-col items-center justify-center gap-y-20">
              <Faq />
              <NewsLetter />
              <Footer containerClass="mb-0 p-0 sm:px-0 w-full md:w-[90%]" />
            </div>
          )}
        </div>
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
    </>
  );
};

export default Home;

const ConnectStep = ({ 
  showSummary = false, 
  onError, 
  onSuccess,
  setErrorRetryFunction,
}: { 
  showSummary?: boolean, 
  onError: (err: string) => void, 
  onSuccess: () => void,
  setErrorRetryFunction:  React.Dispatch<React.SetStateAction<() => Promise<void>>>
 }) => {
  const [randomWallet, setRandomWallet] = useState<IRandomWallet>();
  const [completedSteps, setCompletedSteps] = useState<ConnectWeb3PayStep[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState<ConnectWeb3PayStep>("start");
  const [stepLoader, setStepLoader] = useState(false);

  const { walletProvider, address: web3PayAddress, selectedEnv } = useWallet();

  const handleStep = async (step: ConnectWeb3PayStep) => {
    switch (step) {
      case "start": 
        await handleCreateAndFundRandomWallet();
        break;
      case "connect":
        await importAccount(randomWallet as IRandomWallet);
        break;
      default:
        break;
    }
  }
  async function handleCreateAndFundRandomWallet() {
    try {
      setStepLoader(true);
      const privateKeyBuf = generatePrivate();
      const publicKeyBuf = getPublic(privateKeyBuf);

      const privateKey = privateKeyBuf.toString("hex");
      const publicKey = publicKeyBuf.toString("hex");

      const address = privateKeyToAddress(
        privateKey.startsWith("0x") ? (privateKey as Hex) : `0x${privateKey}`
      );

      await fundAccount(address);
      setRandomWallet({
        publicKey,
        privateKey,
        address,
        keyType: "secp256k1",
      });
      setCompletedSteps([...completedSteps, "start"]);
      setCurrentStep("connect");
    } catch (err: any) {
      console.error("error while creating random wallet", err);
      onError("Error while creating or funding wallet");
      setErrorRetryFunction(() => handleCreateAndFundRandomWallet());
    } finally {
      setStepLoader(false);
    }
  }

  async function fundAccount(address: string) {
    try {
        setStepLoader(true);
        const baseUrl = calculateBaseUrl(selectedEnv);

        const resp = await axios.post(`${baseUrl}/api/mint`, {
          chainId: "421614",
          toAddress: address,
        });
        const { txHash: hash, message } = resp.data;
        // setTxHash(hash);
        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http(
            "https://arbitrum-sepolia.infura.io/v3/dee726a2930e4573a743a5c8f79942c1"
          ),
        });
        if (hash) {
          await waitForTransactionReceipt(publicClient, {
            hash,
          });
        } else {
          throw new Error("Failed to fund test wallet");
        }

    } catch (error: any) {
      onError("Error while Funding Wallet");
      // check if user has enough balance and proceed to next step
    } finally {
      setStepLoader(false);
    }
  }

  async function importAccount(randWallet: IRandomWallet) {
    try {
      setStepLoader(true);
      if (web3PayAddress) {
        const { privateKey, publicKey, keyType } = randWallet;
        let sessionId = OpenloginSessionManager.generateRandomSessionKey();
        const sessionMgr = new OpenloginSessionManager({ sessionId });
        sessionId = await sessionMgr.createSession({
          privateKey,
          publicKey,
          keyType,
        });

        const response = await walletProvider?.request({
          method: "wallet_importW3aSession",
          params: {
            sessionId,
          },
        });
        console.log("Response", response);
        setCompletedSteps([...completedSteps, "connect"]);

        onSuccess();
      }
    } catch (e: unknown) {
      console.error("error importing account", e);
      onError("Error while connecting account");
      throw e;
    } finally {
      setStepLoader(true);
    }
  }
  return (
    <div className="flex flex-col items-center justify-center">
      {!showSummary && (
        <>
          <p className="text-4xl font-bold">Connecting with Web3Pay</p>
          <p className="text-2xl font-normal mt-2 w-full md:w-[60%] text-center">
            For demo purposes, a test funded wallet will be used instead of your
            external EOA wallets
          </p>
        </>
      )}
      <div
        className={cn(
          "mt-16 w-full flex items-center flex-col sm:flex-row justify-center lg:w-[85%] xl:w-[60%]",
          { "mt-0": showSummary }
        )}
      >
        <ImportFlowCard
          title="Create your funded wallet on Arbitrum"
          description="Get a funded test wallet for the demo that will stand in for your external wallets"
          step="1"
          isCompleted={completedSteps.includes("start")}
          isCurrent={currentStep === "start"}
          logo="arbitrum"
          resultOpacity
          resultText={sliceAddress(randomWallet?.address || "")}
          resultLogo="arbitrum"
          handleClick={() => handleStep('start')}
          btnText="Create test wallet"
          loading={stepLoader}
          handleCompletedLink={() =>
            openInNewTab(
              `https://sepolia.arbiscan.io/address/${randomWallet?.address}`
            )
          }
        />
        <Image
          src="/icons/arrow-right.svg"
          alt="arrow"
          height={50}
          width={50}
          className="rotate-90 my-5 mx-auto block md:hidden"
        />
        <Image
          src="/icons/arrow-white.svg"
          alt="arrow"
          height={100}
          width={100}
          className="hidden md:block"
        />
        <ImportFlowCard
          title="Connect your wallet to Web3Pay Account"
          description="Allow your Web3Pay Account to access liquidity from your test wallet."
          step="2"
          isCompleted={completedSteps.includes("connect")}
          isCurrent={currentStep === "connect"}
          logo="arbitrum"
          resultOpacity
          resultText={sliceAddress(randomWallet?.address || "")}
          resultLogo="arbitrum"
          handleClick={() => handleStep("connect")}
          btnText="Connect Test Wallet"
          loading={stepLoader}
          handleCompletedLink={() =>
            openInNewTab(
              `https://sepolia.arbiscan.io/address/${randomWallet?.address}`
            )
          }
        />
      </div>
    </div>
  );
};


const CrossMintingStep = ({
  showSummary = false,
  onSuccess,
  onError,
  setErrorRetryFunction,
}: {
  showSummary?: boolean;
  onSuccess: () => void;
  onError: (err: string) => void;
  setErrorRetryFunction:  React.Dispatch<React.SetStateAction<() => Promise<void>>>
}) => {
  const { walletProvider, address: web3PayAddress, selectedEnv } = useWallet();
  const [mintNftState, setMintNftState] = useState({
    minting: false,
    mintSuccess: false,
    mintError: "",
    userOpHashUrl: "",
    txHashUrl: "",
  });
   
  async function mintNft() {
    try {
      setMintNftState({
        mintError: "",
        minting: true,
        mintSuccess: false,
        userOpHashUrl: "",
        txHashUrl: "",
      });
      const data = encodeFunctionData({
        abi: erc721Abi,
        functionName: "mint",
        args: [web3PayAddress],
      });

      const resp = await walletProvider?.request({
        method: "eth_sendTransaction",
        params: {
          from: web3PayAddress,
          to: "0xd774B6e1880dC36A3E9787Ea514CBFC275d2ba61",
          data,
          value: "0",
        },
      });
      if (resp) {
        // setMintSuccess(true);
        setMintNftState({
          mintError: "",
          minting: false,
          mintSuccess: true,
          userOpHashUrl: `https://jiffyscan.xyz/userOpHash/${resp}`,
          txHashUrl: "",
        });
        await waitForMinting(resp);
      }
      const nftImageUrl = `${calculateBaseUrl(
        selectedEnv
      )}/wallet/nft/0xd774B6e1880dC36A3E9787Ea514CBFC275d2ba61`;
    } catch (e: unknown) {
      console.error("error minting nft", e);
      setErrorRetryFunction(async () => await mintNft());
      onError("Error while minting");
      setMintNftState({
        mintError: "Error while minting",
        minting: false,
        mintSuccess: false,
        userOpHashUrl: "",
        txHashUrl: "",
      });
      throw e;
    } finally {
    }
  }

  async function waitForMinting(hash: Hex) {
    const bundlerClient = createClient({
      chain: polygonAmoy,
      transport: http(
        "https://rpc-proxy.web3auth.io/?network=80002"
      ),
    }).extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));

    // wait for user op hash to be completed
    const userOperationByHash = await bundlerClient.waitForUserOperationReceipt(
      {
        hash,
        timeout: 1000 * 60 * 3,
        pollingInterval: 1000 * 3,
      }
    );
    if (userOperationByHash.receipt) {
      setMintNftState({
        mintError: "",
        minting: false,
        mintSuccess: true,
        userOpHashUrl: `https://jiffyscan.xyz/userOpHash/${hash}`,
        txHashUrl: `https://amoy.polygonscan.com/tx/${userOperationByHash.receipt.transactionHash}`,
      });
    }
  }
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!showSummary && (
        <>
          <p className="text-4xl font-bold">
            {mintNftState.mintSuccess ? "Cross-Chain Minting" : "Connecting with Web3Pay"}
          </p>
          <p className="text-2xl font-normal mt-2 w-full md:w-[60%] text-center">
            {mintNftState.mintSuccess
              ? "Next, use funds from your test wallet to mint your first NFT on a different chain."
              : "For demo purposes, a test funded wallet will be used instead of your external EOA wallets"}
          </p>
          {mintNftState.mintSuccess && (
            <Button
              onClick={() => onSuccess()}
              title="View Demo Summary"
              otherClasses="bg-primary"
              style={{ marginTop: "24px" }}
            />
          )}
        </>
      )}
      <div
        className={cn("w-full xl:w-[80%] mt-16", {
          "mt-10": mintNftState.mintSuccess,
          "mt-0": showSummary,
        })}
      >
        <Card
          active
          cardClasses={`${
            mintNftState.mintSuccess ? "!p-6 md:!px-16 md:!py-10" : "!p-0"
          } !w-full bg-primary`}
          rootClasses="!w-full"
        >
          <div
            className={cn("flex flex-col md:flex-row items-start gap-x-16", {
              "items-center": mintNftState.mintSuccess,
            })}
          >
            {mintNftState.mintSuccess ? (
              <span className="relative w-full md:w-[50%]">
                <Image
                  src={"/images/web3pay-nft.png"}
                  alt="cross chain nft mint"
                  height={300}
                  width={300}
                  className="w-full h-full md:w-[300px] md:h-[300px]"
                />
                <Image
                  src={`/icons/polygon.svg`}
                  alt={"polygon"}
                  height={50}
                  width={50}
                  className="absolute -top-3 -right-3"
                />
              </span>
            ) : (
              <Image
                src={"/images/cross-chain-nft-mint.png"}
                alt="cross chain nft mint"
                height={500}
                width={400}
                className="w-full h-full"
              />
            )}
            <div
              className={cn("flex flex-col w-full p-10 md:pl-0 h-full", {
                "p-0 mt-6": mintNftState.mintSuccess,
              })}
            >
              <div className="flex items-center gap-x-2 w-fit">
                <Image
                  src={`/icons/arbitrum.svg`}
                  alt={"arbitrum"}
                  height={30}
                  width={30}
                />
                <HiOutlineArrowSmRight />
                <Image
                  src={`/icons/polygon.svg`}
                  alt={"polygon"}
                  height={30}
                  width={30}
                />
              </div>
              <p className="text-2xl font-bold text-white w-full mt-4 break-words">
                {mintNftState.mintSuccess
                  ? "MINT SUCCESSFUL!"
                  : "Mint your first cross-chain NFT with Web3Pay!"}
              </p>
              <p
                className={cn(
                  "text-lg font-normal text-gray-400 w-full md:w-[70%] mt-2 mb-6 break-words",
                  {
                    "md:w-[80%] mb-0": mintNftState.mintSuccess,
                  }
                )}
              >
                {mintNftState.mintSuccess
                  ? showSummary
                    ? "Hooray! You just minted a polygon NFT with Arbitrum tokens! "
                    : "You just minted a polygon NFT with Arbitrum tokens! It should appear in your wallet in about 5 minutes."
                  : "Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridging required."}
              </p>
              {mintNftState.mintSuccess && (
                <Link
                  target="_blank"
                  href={mintNftState.txHashUrl || mintNftState.userOpHashUrl}
                  className="text-lg font-normal text-blue-500 mt-6"
                >
                  View transaction on Polygon
                </Link>
              )}
              {/* {mintNftState.mintSuccess && (
                <Link
                  href={""}
                  className="text-lg font-normal text-blue-500 mt-2"
                >
                  View transaction on Arbitrum
                </Link>
              )} */}
              {mintNftState.mintSuccess ? (
                <Button
                  title="Share your experience on X"
                  otherClasses="bg-primary max-md:!w-full"
                  style={{ marginTop: "24px" }}
                  onClick={() => {
                    openInNewTab("https://twitter.com/intent/tweet?text=I%27ve%20managed%20to%20mint%20an%20NFT%20on%20Polygon%20using%20Arbitrum%20tokens!%20Try%20it%20here!%20%23web3pay&url=https://demo-web3pay.tor.us/home")
                  }}
                />
              ) : (
                <GradientButton
                  loading={mintNftState.minting}
                  title="Mint NFT"
                  handleClick={() => {mintNft()}}
                  btnClass="max-md:!w-full"
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};



