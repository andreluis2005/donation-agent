// app/ClientProviders.tsx
"use client";

import { WagmiProvider, createConfig, http, useChainId } from "wagmi";
import { base, baseSepolia, celo, celoAlfajores } from "wagmi/chains";
import { walletConnect, injected, coinbaseWallet } from "@wagmi/connectors";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const projectId =
	process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "7dfe94d41de1c06e";

const wagmiConfig = createConfig({
	chains: [baseSepolia, base, celoAlfajores, celo],
	connectors: [
		injected({ target: "metaMask" }),
		walletConnect({
			projectId,
			showQrModal: true,
			metadata: {
				name: "Onchain Donation",
				description: "Doações em múltiplas redes",
				url: "https://onchaindonation.vercel.app",
				icons: ["https://onchaindonation.vercel.app/icon.png"],
			},
		}),
		coinbaseWallet({ appName: "Onchain Donation" }),
	],
	transports: {
		[baseSepolia.id]: http("https://sepolia.base.org"),
		[base.id]: http("https://mainnet.base.org"),
		[celoAlfajores.id]: http("https://alfajores-forno.celo-testnet.org"),
		[celo.id]: http("https://forno.celo.org"),
	},
});

const queryClient = new QueryClient();

// Este componente garante que o MiniKit sempre tenha uma chain válida
function SafeMiniKitProvider({ children }: { children: React.ReactNode }) {
	const chainId = useChainId();
	const [currentChain, setCurrentChain] = useState(baseSepolia);

	useEffect(() => {
		const chainMap: Record<number, typeof baseSepolia> = {
			[baseSepolia.id]: baseSepolia,
			[base.id]: base,
			[celoAlfajores.id]: celoAlfajores,
			[celo.id]: celo,
		};

		if (chainId && chainMap[chainId]) {
			setCurrentChain(chainMap[chainId]);
		}
	}, [chainId]);

	return (
		<MiniKitProvider
			apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY || ""}
			chain={currentChain} // ← SEMPRE tem uma chain válida
		>
			{children}
		</MiniKitProvider>
	);
}

export default function ClientProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null; // evita erro de hidratação

	return (
		<WagmiProvider config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<SafeMiniKitProvider>{children}</SafeMiniKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
