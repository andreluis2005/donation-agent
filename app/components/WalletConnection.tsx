// app/components/WalletConnection.tsx

"use client";

import { useCallback, useState, useEffect } from "react";
import { useConnect, useDisconnect, useAccount, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import {
	FaWallet,
	FaPlug,
	FaBitcoin,
	FaWallet as FaCoinbase,
} from "react-icons/fa";
import { Connector, CreateConnectorFn } from "wagmi";

export default function WalletConnection({
	onConnect,
	isDarkMode,
}: {
	onConnect: (address: `0x${string}`) => void;
	isDarkMode: boolean;
}) {
	const { address, chainId } = useAccount();
	const { connect, connectors, isPending: isConnecting } = useConnect();
	const { disconnect } = useDisconnect();
	const { switchChain } = useSwitchChain();
	const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
	const [clientAddress, setClientAddress] = useState<string | undefined>(
		undefined,
	);

	useEffect(() => {
		if (address) {
			setClientAddress(address);
			onConnect(address);
			if (chainId !== baseSepolia.id) {
				try {
					switchChain({ chainId: baseSepolia.id });
				} catch (err) {
					console.error(
						"Failed to switch to Base Sepolia:",
						err instanceof Error ? err.message : "Unknown error",
					);
				}
			}
		} else {
			setClientAddress(undefined);
		}
	}, [address, chainId, onConnect, switchChain]);

	const uniqueConnectors = connectors.reduce(
		(acc: Connector<CreateConnectorFn>[], current, index, self) => {
			const isMetaMask =
				current.rdns === "io.metamask" ||
				current.name.toLowerCase().includes("metamask");
			const isWalletConnect = current.name
				.toLowerCase()
				.includes("walletconnect");
			if (isWalletConnect) {
				return acc;
			}
			if (isMetaMask) {
				const lastMetaMaskIndex = self.reduce((lastIdx, c, i) => {
					return c.rdns === "io.metamask" ||
						c.name.toLowerCase().includes("metamask")
						? i
						: lastIdx;
				}, -1);
				if (index === lastMetaMaskIndex) {
					acc.push(current);
				}
			} else if (!acc.find((c) => c.id === current.id)) {
				acc.push(current);
			}
			return acc;
		},
		[] as Connector<CreateConnectorFn>[],
	);

	const handleConnectWallet = useCallback(
		async (connector: (typeof connectors)[number]) => {
			try {
				await connect({ connector });
				setIsWalletMenuOpen(false);
			} catch (err: unknown) {
				console.error(
					"Connection error:",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		},
		[connect],
	);

	const handleDisconnect = useCallback(async () => {
		try {
			await disconnect();
			setClientAddress(undefined);
			setIsWalletMenuOpen(false);
		} catch (err) {
			console.error(
				"Disconnection error:",
				err instanceof Error ? err.message : "Unknown error",
			);
		}
	}, [disconnect]);

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (!isWalletMenuOpen) return;
			const key = event.key;
			const index = parseInt(key) - 1;
			if (index >= 0 && index < uniqueConnectors.length) {
				handleConnectWallet(uniqueConnectors[index]);
			}
		},
		[isWalletMenuOpen, uniqueConnectors, handleConnectWallet],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [handleKeyPress]);

	const getConnectorIcon = (connectorName: string) => {
		if (connectorName.toLowerCase().includes("metamask")) {
			return <FaBitcoin className="w-6 h-6" />;
		} else if (connectorName.toLowerCase().includes("coinbase")) {
			return <FaCoinbase className="w-6 h-6" />;
		}
		return <FaWallet className="w-6 h-6" />;
	};

	if (!clientAddress) {
		return (
			<div
				className={`flex flex-col items-center gap-4 w-full ${
					isDarkMode ? "text-white" : "text-black"
				}`}
			>
				<p className="text-lg drop-shadow-md">Connect your wallet to start:</p>
				<div className="relative">
					<button
						onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
						disabled={isConnecting}
						className={`px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 ${
							isConnecting ? "bg-gray-600 cursor-not-allowed" : ""
						} ${isDarkMode ? "bg-blue-700/80 hover:bg-blue-800/80" : ""}`}
						aria-label="Connect Wallet"
						aria-busy={isConnecting}
					>
						{isConnecting ? (
							<span className="flex items-center gap-2">
								<svg
									className="animate-spin h-5 w-5 text-white"
									role="status"
									aria-label="Connecting"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Connecting...
							</span>
						) : (
							<>
								<FaWallet />
								Connect Wallet
							</>
						)}
					</button>
					{isWalletMenuOpen && (
						<div
							className={`absolute top-14 left-0 right-0 ${
								isDarkMode
									? "bg-gray-800 border-gray-700 text-gray-100"
									: "bg-white border-gray-300 text-gray-800"
							} border rounded-lg shadow-lg p-4 z-50 animate-slide-in w-full max-w-md mx-auto`}
						>
							<h3 className="text-xl font-semibold mb-4 text-center">
								Choose your wallet
							</h3>
							<p className="text-sm text-gray-400 mb-4 text-center">
								Press 1, 2, 3... to select quickly
							</p>
							<ul className="space-y-2">
								{uniqueConnectors.map((connector, index) => (
									<li key={connector.id}>
										<button
											onClick={() => handleConnectWallet(connector)}
											disabled={isConnecting}
											className={`w-full p-3 text-left rounded-lg hover:bg-gray-700/50 transition-all duration-300 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
												isDarkMode
													? "text-gray-100 hover:bg-gray-600/50"
													: "text-gray-800 hover:bg-gray-200/50"
											}`}
											aria-label={`Connect with ${connector.name} (Press ${index + 1})`}
										>
											{getConnectorIcon(connector.name)}
											<span>{`${index + 1}. ${connector.name}`}</span>
										</button>
									</li>
								))}
							</ul>
							<button
								onClick={() => setIsWalletMenuOpen(false)}
								className={`w-full mt-4 px-4 py-2 rounded-lg ${
									isDarkMode
										? "bg-gray-600 hover:bg-gray-700 text-gray-100"
										: "bg-gray-200 hover:bg-gray-300 text-gray-800"
								} transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 ${
									isDarkMode ? "focus:ring-gray-500" : "focus:ring-gray-400"
								}`}
								aria-label="Close wallet selection modal"
							>
								Close
							</button>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div
			className={`text-base font-medium mb-8 text-center flex items-center justify-center gap-3 ${
				isDarkMode ? "text-white" : "text-black"
			} drop-shadow-md w-full flex-wrap`}
		>
			<p className="truncate max-w-xs">{`Wallet Connected: ${clientAddress.slice(0, 6)}...${clientAddress.slice(-4)}`}</p>
			<p>Chain ID: {chainId}</p>
			{chainId !== baseSepolia.id && (
				<button
					onClick={() => switchChain({ chainId: baseSepolia.id })}
					className={`bg-yellow-500/70 text-white p-2 rounded-full hover:bg-yellow-600/70 transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 hover:scale-105 ${
						isDarkMode
							? "dark:bg-yellow-600/70 dark:hover:bg-yellow-700/70"
							: ""
					}`}
					aria-label="Switch to Base Sepolia"
				>
					Switch to Base Sepolia
				</button>
			)}
			<button
				onClick={handleDisconnect}
				className={`bg-gray-600/70 text-white p-2 rounded-full hover:bg-gray-800/70 transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 hover:scale-105 ${
					isDarkMode ? "dark:bg-gray-700/70 dark:hover:bg-gray-900/70" : ""
				}`}
				aria-label="Disconnect Wallet"
			>
				<FaPlug className="w-4 h-4" />
			</button>
		</div>
	);
}
//proxima atualizações

