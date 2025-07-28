"use client";

import { useCallback, useState, useEffect } from "react";
import { useConnect, useDisconnect, useAccount } from "wagmi";
import { FaWallet, FaPlug } from "react-icons/fa";
import { RiLoader4Line } from "react-icons/ri";
import Image from "next/image";

export default function WalletConnection({
	onConnect,
}: {
	onConnect: (address: `0x${string}`) => void;
}) {
	const { address, chainId } = useAccount();
	const { connect, connectors, isPending: isConnecting } = useConnect();
	const { disconnect } = useDisconnect();
	const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

	const handleConnectWallet = useCallback(
		async (connector: (typeof connectors)[number]) => {
			try {
				await connect({ connector });
				if (address) onConnect(address);
				setIsWalletMenuOpen(false);
			} catch (err: unknown) {
				console.error(
					"Connection error:",
					err instanceof Error ? err.message : "Unknown error",
				);
			}
		},
		[connect, address, onConnect],
	);

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (!isWalletMenuOpen) return;
			const key = event.key;
			const index = parseInt(key) - 1;
			if (index >= 0 && index < connectors.length) {
				handleConnectWallet(connectors[index]);
			}
		},
		[isWalletMenuOpen, connectors, handleConnectWallet],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [handleKeyPress]);

	if (!address) {
		return (
			<div className="flex flex-col items-center gap-4 w-full">
				<p className="text-lg text-white drop-shadow-md">
					Connect your wallet to start:
				</p>
				<div className="relative">
					<button
						onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
						disabled={isConnecting}
						className={`bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
							isConnecting ? "opacity-50 cursor-not-allowed" : ""
						} hover:scale-105`}
						aria-label="Connect Wallet"
						aria-expanded={isWalletMenuOpen}
						aria-controls="wallet-menu"
					>
						<span className="flex items-center gap-2">
							{isConnecting ? "Connecting..." : "Connect Wallet"}
							<FaWallet />
						</span>
					</button>
					{isWalletMenuOpen && (
						<div
							id="wallet-menu"
							className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-all duration-300"
							role="dialog"
							aria-labelledby="wallet-modal-title"
							aria-modal="true"
						>
							<div
								className="w-full max-w-sm p-6 rounded-lg shadow-lg bg-gray-800 text-gray-100 border-gray-600 border animate-slide-in"
								tabIndex={-1}
							>
								<h3
									id="wallet-modal-title"
									className="text-xl font-semibold mb-4 text-center"
								>
									Choose your wallet
								</h3>
								<p className="text-sm text-gray-400 mb-4 text-center">
									Press 1, 2, 3... to select quickly
								</p>
								<ul className="space-y-2">
									{connectors.map((connector, index) => (
										<li key={connector.id}>
											<button
												onClick={() => handleConnectWallet(connector)}
												disabled={isConnecting}
												className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 text-sm transition-all duration-200 hover:bg-gray-700 ${
													isConnecting ? "opacity-50 cursor-not-allowed" : ""
												}`}
												aria-label={`Connect with ${connector.name} (Press ${index + 1})`}
											>
												{isConnecting ? (
													<RiLoader4Line className="w-6 h-6 animate-spin text-gray-400" />
												) : (
													<Image
														src={`/img/${
															connector.name.toLowerCase().includes("metamask")
																? "metamask"
																: connector.name
																			.toLowerCase()
																			.includes("walletconnect")
																	? "walletconnect"
																	: connector.name
																				.toLowerCase()
																				.includes("coinbase")
																		? "coinbase"
																		: "wallet"
														}.png`}
														alt={`${connector.name} icon`}
														width={24}
														height={24}
														onError={(e) => {
															e.currentTarget.src = "/img/wallet.png";
														}}
													/>
												)}
												<span>{`${index + 1}. ${connector.name}`}</span>
											</button>
										</li>
									))}
								</ul>
								<button
									onClick={() => setIsWalletMenuOpen(false)}
									className="w-full mt-4 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-gray-100 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
									aria-label="Close wallet selection modal"
								>
									Close
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="text-base font-medium mb-8 text-center flex items-center justify-center gap-3 text-white drop-shadow-md w-full flex-wrap">
			<p className="truncate max-w-xs">{`Wallet Connected: ${address.slice(0, 6)}...${address.slice(-4)}`}</p>
			<p>Chain ID: {chainId}</p>
			<button
				onClick={() => disconnect()}
				className="bg-gray-600/70 dark:bg-gray-700/70 text-white p-2 rounded-full hover:bg-gray-800/70 transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 hover:scale-105"
				aria-label="Disconnect Wallet"
			>
				<FaPlug className="w-4 h-4" />
			</button>
		</div>
	);
}
