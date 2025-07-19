"use client";

import { useEffect, useState } from "react";
import { createConfig, WagmiProvider, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

// Configuração do Wagmi
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [metaMask()],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Verifica se o window.ethereum está disponível
    if (typeof window !== "undefined" && window.ethereum) {
      console.log("Ethereum provider detected:", window.ethereum.isMetaMask);
    }
  }, []);

  if (!isClient) {
    return <></>;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <MiniKitProvider
        apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || ""}
        chain={baseSepolia}
      >
        {children}
      </MiniKitProvider>
    </WagmiProvider>
  );
}