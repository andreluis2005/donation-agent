"use client";

import { useEffect, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "@wagmi/connectors";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

// Configuração do Wagmi
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({ target: "metaMask" }),
    walletConnect({
      projectId: "7dfe94d41de1c06a7b02e621eab53009", // Substitua por seu projectId real
    }),
    coinbaseWallet({
      appName: "Donation Agent",
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
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