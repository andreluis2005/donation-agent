"use client";

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
			projectId: "7dfe94d41de1c06e", // Substitua por seu projectId real
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
