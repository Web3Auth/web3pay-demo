import React from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { HiOutlineArrowSmRight } from "react-icons/hi";
import Card from "@/components/ui/Card";
import NewsLetter from "@/components/NewsLetter";
import Footer from "@/components/Footer";

const Web3Pay = ({
  onActionButtonClick,
  isLoading,
  actionButtonText,
}: {
  onActionButtonClick: () => void;
  isLoading: boolean;
  actionButtonText: string;
}) => {
  return (
    <>
      <section className="lg:h-[calc(100dvh_-_80px)] bg-blend-lighten lg:bg-home bg-no-repeat home-bg bg-scroll bg-[100%] flex-grow px-6 py-10 md:p-9 md:pb-14 flex flex-col gap-y-10 md:gap-y-20 my-20">
        <div className="flex flex-col text-left gap-y-6 lg:pl-16 mt-2.5">
          <div className="text-left text-3xl sm:banner-heading-text flex flex-col gap-y-1">
            <p>Abstract everything, </p>
            <p>everywhere, all at once,</p>
            <div className="flex flex-col items-start gap-y-6">
              <div className="flex items-center justify-between gap-x-3">
                <p className="gradient-text">with Web3Pay</p>
                <div className="alpha-tag">Alpha</div>
              </div>
              {/* make this conditional based on input prop */}
              <Button
                handleClick={onActionButtonClick}
                title={actionButtonText}
                icon={<HiOutlineArrowSmRight className="text-white text-xl" />}
                otherClasses="tracking-normal"
                loading={isLoading}
              />
            </div>
          </div>
        </div>
        <Image
          src="/images/mobilehero.png"
          alt="bg"
          height={200}
          width={200}
          className="w-full h-full lg:hidden"
          priority
        />
        <div className="flex flex-col text-left gap-y-4 max-lg:mx-auto lg:pl-16 lg:mt-auto">
          <Image
            src="/images/stroke-divider.svg"
            alt="stroke"
            height={50}
            width={280}
            priority
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
            priority
          />
        </div>
      </section>

      <section className="lg:h-[100dvh] flex flex-col gap-y-10 md:gap-y-20 py-10 md:py-20">
        <p className="text-center text-32 lg:text-5xl text-white">
          Use, Interact and Spend Crypto As One
        </p>
        <div className="flex flex-col lg:flex-row items-center gap-y-6 lg:gap-x-10">
          {/* <Image
            src="/images/web3pay-user.svg"
            alt="Web3PayUser"
            height={500}
            width={600}
            className="w-full lg:w-[40%] md:h-[480px] lg:h-[500px]"
          /> */}
          <video
            width="320"
            height="240"
            className="w-full lg:w-[40%] md:h-[480px] lg:h-[500px]"
            autoPlay
            loop
            muted
            // controls
            // poster="/images/web3pay-user.svg"
          >
            <source src="/videos/Web3paygif3.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="flex flex-col gap-y-6 md:gap-y-8 lg:gap-y-10 lg:w-[60%] p-6 md:p-10 lg:pr-16">
            <div className="text-left flex flex-col gap-y-2">
              <p className="text-xl md:text-[32px] font-semibold leading-9 text-white break-words">
                Interact effortlessly with any chain with assets you already own
              </p>
              <p className="text-base md:text-2xl font-normal text-gray-400">
                Easily transact with any chain, regardless of their native token
                or wallet you’re using. Use any chain without complicated
                bridging steps.
              </p>
            </div>
            <div className="gradient-divider"> </div>
            <div className="text-left flex flex-col gap-y-2">
              <p className="text-xl md:text-[32px] font-semibold leading-9 text-white break-words">
                Use your different wallets, no matter the type
              </p>
              <p className="text-base md:text-2xl font-normal text-gray-400">
                Effortlessly connect liquidity across multiple wallets and
                blockchains, enabling you to transact and spend easily.
              </p>
            </div>
            <div className="gradient-divider"> </div>
            <div className="text-left flex flex-col gap-y-2">
              <p className="text-xl md:text-[32px] font-semibold leading-9 text-white break-words">
                Spend anywhere, anytime, directly via wallet or debit card
                (Coming Soon)
              </p>
              <p className="text-base md:text-2xl font-normal text-gray-400">
                Always be able to spend using your crypto, be it directly or
                with a virtual/physical card.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col py-10 md:py-20 md:mt-32">
        <p className="text-base md:text-lg uppercase text-gray-400 text-center md:text-left mb-4 px-6 md:px-20 font-semibold">
          SERVICES
        </p>
        <p className="text-center text-32 lg:text-5xl text-white mb-4 px-4 md:px-20 md:text-left">
          Web3Pay for Developers
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-x-6 items-stretch justify-center w-full p-6 md:px-20 md:py-10">
          <Card
            cardClasses="flex flex-col items-start p-9 w-full"
            rootClasses="!w-auto"
            active
          >
            <Image
              src="/icons/thunder.svg"
              alt="Service 1"
              height={30}
              width={30}
            />
            <p className="lg:text-2xl text-xl break-words text-left text-white font-semibold mt-10 mb-6">
              Boost engagement for your applications
            </p>
            <p className="text-lg font-normal text-gray-400 text-left">
              Keeping user activities within the dApp/wallet so that your users
              can focus on what truly matters
            </p>
          </Card>
          <Card
            cardClasses="flex flex-col items-start p-9 w-full"
            rootClasses="!w-auto"
            active
          >
            <Image
              src="/icons/finger-print.svg"
              alt="Service 1"
              height={30}
              width={30}
            />
            <p className="lg:text-2xl text-xl break-words text-left text-white font-semibold mt-10 mb-6">
              An authentication experience that works
            </p>
            <p className="text-lg font-normal text-gray-400 text-left">
              Passkeys provide your users a more secure login method, doing away
              with passwords
            </p>
          </Card>
          <Card
            cardClasses="flex flex-col items-start p-9 w-full"
            rootClasses="!w-auto"
            active
          >
            <Image
              src="/icons/link.svg"
              alt="Service 1"
              height={30}
              width={30}
            />
            <p className="lg:text-2xl text-xl break-words text-left text-white font-semibold mt-10 mb-6">
              Infrastructure that is designed to support all chains and assets
            </p>
            <p className="text-lg font-normal text-gray-400 text-left">
              Enhancing your user’s experience by simplifying interactions on
              multiple chains
            </p>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <NewsLetter />
      </section>

      <Footer />
    </>
  );
};

export default Web3Pay;
