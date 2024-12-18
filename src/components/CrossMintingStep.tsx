import { useWallet } from "@/context/walletContext";
import {
  calculateBaseUrl,
  cn,
  nftContractAddress,
  parseSdkError,
} from "@/utils/utils";
import Link from "next/link";
import Image from "next/image";
import { bundlerActions, ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { useEffect, useState } from "react";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import { encodeFunctionData, Hex, createClient, http } from "viem";
import { polygonAmoy } from "viem/chains";
import Button from "./ui/Button";
import Card from "./ui/Card";
import GradientButton from "./ui/GradientButton";
import { erc721Abi } from "@/utils/abis/erc721";
import ErrorPopup from "./ErrorPopup";
import { Modal } from "./ui/Modal";
import { useRouter } from "next/navigation";
import { openInNewTab } from "@/utils";
import useMintStore, { MINT_STEPS, STEPS } from "@/lib/store/mint";
import Loader from "./ui/Loader";
import { ISdkErorr } from "@/utils/interfaces";

const CrossMintingStep = ({
  showSummary = false,
  onSuccess,
}: {
  showSummary?: boolean;
  onSuccess: () => void;
}) => {
  const router = useRouter();
  const { resetMintState, mintNftState, setMintNftState, setActiveStep } =
    useMintStore();
  const {
    walletProvider,
    address: web3PayAddress,
    selectedEnv,
    setLoggedIn,
    error: errorFromWallet,
  } = useWallet();
  const [displayErrorPopup, setDisplayErrorPopup] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [subErrorText, setSubErrorText] = useState("");

  async function mintNft() {
    try {
      setActiveStep(STEPS.CROSS_CHAIN_MINTING);
      setMintNftState({
        mintStep: MINT_STEPS.MINTING,
        mintError: "",
        userOpHashUrl: "",
        txHashUrl: "",
      });
      const data = encodeFunctionData({
        abi: erc721Abi,
        functionName: "mint",
        args: [web3PayAddress],
      });

      const resp = await walletProvider?.request<`0x${string}`>({
        method: "eth_sendTransaction",
        params: {
          from: web3PayAddress,
          to: nftContractAddress,
          data,
          value: "0",
        },
      });

      if (resp) {
        // setMintSuccess(true);
        setMintNftState({
          mintStep: MINT_STEPS.WAITING,
          mintError: "",
          userOpHashUrl: `https://jiffyscan.xyz/userOpHash/${resp}`,
          txHashUrl: "",
        });
        await waitForMinting(resp);
      }
      const nftImageUrl = `${calculateBaseUrl(
        selectedEnv
      )}/wallet/nft/${nftContractAddress}`;
    } catch (e: unknown) {
      console.error("error minting nft", e);
      const walletError = e as ISdkErorr;
      if (walletError.code === 4100) {
        // unauthorized, user not logged in
        setLoggedIn(false);
        router.push("/");
      }

      setDisplayErrorPopup(true);
      const parsedError = parseSdkError(e);
      setErrorText(parsedError.errorText);
      setSubErrorText(parsedError.subErrorText);

      // user closed popup without completing transaction
      if (walletError.code === 4001) {
        setMintNftState({
          mintError: "",
          mintStep: MINT_STEPS.START,
          userOpHashUrl: "",
          txHashUrl: "",
        });
        return;
      }
      setMintNftState({
        mintError: "Error while minting",
        mintStep: MINT_STEPS.FAILED,
        userOpHashUrl: "",
        txHashUrl: "",
      });
    } finally {
    }
  }

  async function waitForMinting(hash: Hex) {
    const bundlerClient = createClient({
      chain: polygonAmoy,
      transport: http("https://rpc-proxy.web3auth.io/?network=80002"),
    }).extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));

    // wait for user op hash to be completed
    const userOperationByHash = await bundlerClient.waitForUserOperationReceipt(
      {
        hash,
        timeout: 1000 * 60,
        pollingInterval: 2000,
      }
    );
    if (userOperationByHash.receipt) {
      setMintNftState({
        mintError: "",
        mintStep: MINT_STEPS.SUCCESS,
        userOpHashUrl: `https://jiffyscan.xyz/userOpHash/${hash}`,
        txHashUrl: `https://amoy.polygonscan.com/tx/${userOperationByHash.receipt.transactionHash}`,
      });
    }
  }

  async function onRetry() {
    try {
      setDisplayErrorPopup(false);
      await mintNft();
    } catch (e: unknown) {
      console.error("error on retrying mint", e);
      setDisplayErrorPopup(true);
    }
  }

  useEffect(() => {
    if (errorFromWallet) {
      // show error
      setDisplayErrorPopup(true);
      setErrorText("Minting failed");
      setSubErrorText(errorFromWallet);
    } else {
      setDisplayErrorPopup(false);
      setErrorText("");
      setSubErrorText("");
    }
  }, [errorFromWallet]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!showSummary && (
        <>
          <p className="text-3xl md:text-4xl font-bold text-center">
            Cross-Chain Minting
          </p>
          <p className="text-base md:text-2xl font-normal mt-2 w-full md:w-[60%] text-center">
            Next, use funds from your test wallet to mint your first NFT on a
            different chain.
          </p>
          {mintNftState.txHashUrl && (
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
        className={cn(
          "w-full lg:w-[80%] xl:w-[900px] h-full md:h-[370px] mt-6 md:mt-16",
          {
            "mt-6 md:mt-10": mintNftState.mintStep === MINT_STEPS.SUCCESS,
            "mt-0": showSummary,
            "my-auto": mintNftState.mintStep === MINT_STEPS.WAITING,
            // "h-full md:h-[370px]":
            //   mintNftState.mintStep === MINT_STEPS.SUCCESS ||
            //   mintNftState.mintStep === MINT_STEPS.FAILED,
            // "h-full md:h-[365px]":
            //   mintNftState.mintStep === MINT_STEPS.START ||
            //   mintNftState.mintStep === MINT_STEPS.MINTING,
          }
        )}
      >
        <Card
          active
          cardClasses={`h-full md:h-[370px] ${
            mintNftState.mintStep === MINT_STEPS.START ||
            mintNftState.mintStep === MINT_STEPS.MINTING
              ? "!p-0"
              : "!p-6 lg:!px-16 my-auto"
          } !w-full bg-primary`}
          rootClasses={`!w-full h-full md:h-[372px]`}
        >
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 items-start m-auto",
              {
                "items-center": mintNftState.mintStep !== MINT_STEPS.START,
              }
            )}
          >
            {mintNftState.mintStep === MINT_STEPS.WAITING && (
              <div className="w-full ml-24 my-auto">
                <Loader size="xl" />
              </div>
            )}

            {mintNftState.mintError && (
              <div className="w-full h-full md:w-[317px] md:h-[317px] my-auto">
                <div className="relative w-full h-full md:w-[317px] md:h-[317px]">
                  <Image
                    src={"/images/mint-failed.svg"}
                    alt="cross chain nft mint"
                    height={300}
                    width={300}
                    className="w-full h-full md:w-[317px] md:h-[317px]"
                  />
                </div>
              </div>
            )}

            {/* Success State */}
            {mintNftState.mintStep === MINT_STEPS.SUCCESS && (
              <div className="w-full h-full md:w-[300px] md:h-[300px]">
                <div className="relative w-full h-full md:w-[300px] md:h-[300px]">
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
                    className="absolute -top-3 -right-3 h-[50px] w-[50px]"
                  />
                </div>
              </div>
            )}
            {/* Mint State */}
            {(mintNftState.mintStep === MINT_STEPS.START ||
              mintNftState.mintStep === MINT_STEPS.MINTING) && (
              <div className="h-full md:h-[362px]">
                <Image
                  src={"/images/cross-chain-nft-mint.png"}
                  alt="cross chain nft mint"
                  height={362}
                  width={400}
                  className="w-full h-full"
                />
              </div>
            )}
            <div
              className={cn(
                "flex flex-col items-start justify-center w-full p-0 h-full",
                {
                  "p-6 md:pl-10":
                    mintNftState.mintStep === MINT_STEPS.START ||
                    mintNftState.mintStep === MINT_STEPS.MINTING,
                }
              )}
            >
              <div className="flex items-center gap-x-2 w-fit max-md:mt-4">
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

              <p
                className={cn(
                  "text-2xl font-bold text-white w-full mt-4 break-words",
                  {
                    "text-2xl md:text-4xl":
                      mintNftState.mintStep === MINT_STEPS.SUCCESS ||
                      mintNftState.mintStep === MINT_STEPS.FAILED,
                  }
                )}
              >
                {/* Loading */}
                {mintNftState.mintStep === MINT_STEPS.WAITING &&
                  "NFT minting in progress..."}
                {/* Failed */}
                {mintNftState.mintStep === MINT_STEPS.FAILED && "MINT FAILED!"}
                {/* Successful */}
                {(mintNftState.mintStep === MINT_STEPS.SUCCESS ||
                  showSummary) &&
                  (showSummary
                    ? "Try minting cross-chain NFT with Web3Pay again!"
                    : "MINT SUCCESSFUL!")}
                {/* Mint NFT state */}
                {(mintNftState.mintStep === MINT_STEPS.START ||
                  mintNftState.mintStep === MINT_STEPS.MINTING) &&
                  "Mint your first cross-chain NFT with Web3Pay!"}
              </p>

              <p
                className={cn(
                  "text-lg font-normal text-gray-400 w-full mt-2 break-words",
                  {
                    "md:w-full":
                      mintNftState.mintStep === MINT_STEPS.START ||
                      mintNftState.mintStep === MINT_STEPS.MINTING,
                  }
                )}
              >
                {/* waiting State */}
                {mintNftState.mintStep === MINT_STEPS.WAITING &&
                  "You just minted a polygon NFT with Arbitrum tokens! It should appear in your wallet in about 5 minutes."}
                {/* Failed State */}
                {mintNftState.mintStep === MINT_STEPS.FAILED &&
                  "Sorry, there was a little problem. Let’s try minting again to get the experience right."}
                {/* Success and ShowSummary */}
                {mintNftState.mintStep === MINT_STEPS.SUCCESS &&
                  showSummary &&
                  "Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridging required."}
                {/* success and not show summary */}
                {mintNftState.mintStep === MINT_STEPS.SUCCESS &&
                  !showSummary &&
                  !showSummary &&
                  "You just minted a polygon NFT with Arbitrum tokens! It should appear in your wallet in about 5 minutes."}
                {/* not success */}
                {(mintNftState.mintStep === MINT_STEPS.START ||
                  mintNftState.mintStep === MINT_STEPS.MINTING) &&
                  "Use your Arbitrum Test Tokens to mint an NFT on Polygon, no bridging required."}
              </p>

              {/* Success state */}
              {mintNftState.mintStep === MINT_STEPS.SUCCESS && !showSummary && (
                <Link
                  target="_blank"
                  href={mintNftState.txHashUrl || mintNftState.userOpHashUrl}
                  className="text-lg font-normal text-blue-500 mt-6"
                >
                  View transaction on Polygon
                </Link>
              )}

              <div className="flex flex-col gap-y-2 mt-4 max-md:w-full">
                {mintNftState.mintStep === MINT_STEPS.SUCCESS &&
                  showSummary && (
                    <GradientButton
                      loading={
                        mintNftState.mintStep === MINT_STEPS.MINTING ||
                        mintNftState.mintStep === MINT_STEPS.WAITING
                      }
                      title="Mint NFT"
                      handleClick={() => {
                        mintNft();
                      }}
                      btnClass={`max-md:!w-full !w-[164px] ${
                        mintNftState.mintStep === MINT_STEPS.WAITING
                          ? "opacity-25 pointer-events-none"
                          : ""
                      } `}
                    />
                  )}

                {/* {true && (
                <Link
                  href={""}
                  className="text-lg font-normal text-blue-500 mt-2"
                >
                  View transaction on Arbitrum
                </Link>
              )} */}

                {/* Failed State */}
                {mintNftState.mintStep === MINT_STEPS.FAILED && (
                  <Button
                    title="Retry"
                    otherClasses="bg-primary max-md:!w-full"
                    rootClass="max-md:!w-full"
                    onClick={() => {
                      mintNft();
                    }}
                  />
                )}

                {/* Success State */}
                {mintNftState.mintStep === MINT_STEPS.SUCCESS &&
                  !showSummary && (
                    <Button
                      title="Share your experience on X"
                      otherClasses="bg-primary max-md:!w-full"
                      onClick={() => {
                        openInNewTab(
                          "https://twitter.com/intent/tweet?text=I%27ve%20managed%20to%20mint%20an%20NFT%20on%20Polygon%20using%20Arbitrum%20tokens!%20Try%20it%20here!%20%23web3pay&url=https://demo-web3pay.tor.us/home"
                        );
                      }}
                    />
                  )}

                {/* Mint NFT state */}
                {(mintNftState.mintStep === MINT_STEPS.START ||
                  mintNftState.mintStep === MINT_STEPS.MINTING) && (
                  <GradientButton
                    loading={
                      mintNftState.mintStep === MINT_STEPS.MINTING ||
                      mintNftState.mintStep === MINT_STEPS.WAITING
                    }
                    title="Mint NFT"
                    handleClick={() => {
                      mintNft();
                    }}
                    btnClass={`max-md:!w-full !w-[164px] ${
                      mintNftState.mintStep === MINT_STEPS.WAITING
                        ? "opacity-25 pointer-events-none"
                        : ""
                    } `}
                  />
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      <Modal
        isOpen={displayErrorPopup}
        onClose={() => setDisplayErrorPopup(false)}
      >
        <ErrorPopup
          handleTryAgain={onRetry}
          subText={subErrorText}
          text={errorText}
        />
      </Modal>
    </div>
  );
};

export default CrossMintingStep;
