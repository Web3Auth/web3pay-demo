"use client";

import useMintStore from "@/lib/store/mint";
// import useTransactionStore from "@/lib/store/transaction";
import { ReactNode, useEffect, useState } from "react";

export default function ZustandProvider({ children }: { children: ReactNode }) {
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    const init = async () => {
      await useMintStore.persist.rehydrate();
      // await useTransactionStore.persist.rehydrate();
      setRehydrated(true);
    };
    init();
  }, []);

  return <>{rehydrated ? children : <></>}</>;
}
