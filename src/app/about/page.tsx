/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWallet } from "@/context/walletContext";
import Navbar from "@/components/ui/Navbar";
import Web3Pay from "@/components/Web3Pay";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { address, walletProvider, loggedIn } = useWallet();

  return (
    <main className="flex flex-col">
       <Navbar
        address={address}
        containerClass="bg-transparent"
        showButton={true}
        />
      <Web3Pay onActionButtonClick={() => {
        router.push("/home")
      }} isLoading={isLoading} 
        actionButtonText="Enter Web3Pay Demo"
      />
    </main>
  );
}
