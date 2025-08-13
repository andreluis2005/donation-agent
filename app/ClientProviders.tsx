// app/ClientProviders.tsx
"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "@wagmi/connectors";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";

// Configuração do Wagmi
const wagmiConfig = createConfig({
	chains: [base],
	connectors: [
		injected({ target: "metaMask" }),
		walletConnect({
			projectId:
				process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "7dfe94d41de1c06e",
			showQrModal: true,
			metadata: {
				name: "Donation Agent",
				description: "Onchain Donation Platform",
				url: "https://donation-agent.vercel.app",
				icons: ["https://donation-agent.vercel.app/icon.png"],
			},
		}),
		coinbaseWallet({
			appName: "Donation Agent",
		}),
	],
	transports: {
		[base.id]: http("https://mainnet.base.org"),
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
				chain={base}
			>
				{children}
			</MiniKitProvider>
		</WagmiProvider>
	);
}
