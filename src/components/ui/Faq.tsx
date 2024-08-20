import { useState } from "react";
import Image from "next/image";

const FAQList = [
  {
    ques: "What is the Web3Auth Layer?",
    answer:
      "The Web3Auth Layer is an open authentication layer that aggregates and abstracts different fragments of users' digital identities, providing an interoperable Proof of Humanity powered by $AUTH. This innovative layer safeguards genuine human interactions online, combating AI deep fakes, bots, Sybil attacks, and other threats with advanced zero-knowledge proofs. It empowers users to control, monetize, and truly own their identities, paving the way for a more secure and equitable internet ecosystem.",
  },
  {
    ques: "What is the Web3Auth?",
    answer:
      "Web3Auth is the leading Wallet-as-a-Service (WaaS) provider that empowers users to manage a non-custodial wallet intuitively. It leverages enterprise-grade Multi-Party Computation and Account Abstraction tooling, alongside social logins, biometrics, OIDC, and FIDO for a familiar yet seamless user experience. Web3Auth works with Fortune 500 brands like NBCUniversal, Fox Media, McDonald's, SK Planet, and Web3 pioneers like Trust Wallet, Binance, Animoca Brands, and Kukai, among others. To date, it proudly supports thousands of Web3 projects with more than 20 million monthly users.",
  },
  {
    ques: "What are AUTH points?",
    answer:
      "$AUTH points are given to users participating in Phase 1 of Web3Auth Layer. Users with $AUTH points will be eligible for upcoming airdrops and will benefit from exclusive features and rewards within the Web3Auth ecosystem.",
  },
  {
    ques: "How can I earn $AUTH points?",
    answer:
      "There are several methods to earn points, including weekly quests, completing your profile, daily check-ins, referrals, and partner quests. Partner quests are frequently updated and refreshed. Keep a lookout for more features rolling out in Phase 2.",
  },
  {
    ques: "Do i have to connect my wallet?",
    answer:
      "Users can choose to connect their preferred wallet on their profile page.",
  },
];

const FAQ = () => {
  const [faqIdx, setFaqIdx] = useState<number | null>(null);

  const handleFaq = (idx: number) => {
    if (faqIdx === idx) {
      setFaqIdx(null);
    } else {
      setFaqIdx(idx);
    }
  };
  return (
    <>
      <p className="bg-gradient-to-br from-gradient-one via-gradient-two via-60% to-gradient-five inline-block text-transparent bg-clip-text text-4xl md:text-5xl lg:text-[56px] font-bold text-center">
        Frequently Asked Questions
      </p>
      <div className="w-full max-md:px-10 md:w-[70%] md:mx-auto">
        {FAQList.map((item, index) => {
          return (
            <div key={item.ques}>
              <button
                className={`appearance-none flex items-center justify-between py-7 w-full transition-all duration-500`}
                onClick={() => handleFaq(index)}
              >
                <p className="text-lg font-bold text-white text-left">
                  {item.ques}
                </p>
                {faqIdx === index ? (
                  <Image
                    src={"/icons/subtract-line.svg"}
                    alt="open"
                    width={20}
                    height={20}
                    className={`transform origin-center transition duration-300 ease-out ${
                      faqIdx === index && "!rotate-180"
                    }`}
                  />
                ) : (
                  <Image
                    src={"/icons/plus.svg"}
                    alt="open"
                    width={20}
                    height={20}
                    className={`transform origin-center rotate-90 transition duration-300 ease-out ${
                      faqIdx === index && "!rotate-180"
                    }`}
                  />
                )}
              </button>
              <p
                className={`overflow-hidden transition-all duration-[380ms] ease-in-out  ${
                  faqIdx === index ? "max-h-screen" : "max-h-0"
                }`}
              >
                {item.answer}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FAQ;
