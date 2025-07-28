"use client";

import { useState, useEffect } from "react";
import { FaChartBar, FaSyncAlt } from "react-icons/fa";
import WalletConnection from "../components/WalletConnection";
import DonationForm from "../components/DonationForm";
import TransactionHistory from "../components/TransactionHistory";
import StatsModal from "../components/StatsModal";
import DevDonationModal from "../components/DevDonationModal";
import MessageDisplay from "../components/MessageDisplay";
import { useDonationLogic } from "../hooks/useDonationLogic";
import { useTransactionHistory } from "../hooks/useTransactionHistory";
import { useWalletBalance } from "../hooks/useWalletBalance";
import { useAccount } from "wagmi";

export default function Home() {
	const { address } = useAccount();
	const {
		amount,
		setAmount,
		currency,
		setCurrency,
		cause,
		setCause,
		customCommand,
		setCustomCommand,
		isCustomMode,
		setIsCustomMode,
		message,
		setMessage,
		isLoading,
		transactionStatus,
		isCommandValid,
		setIsCommandValid,
		lastDonation,
		handleSubmit,
		isEthBalanceLoading,
		isUsdcBalanceLoading,
		isUsdtBalanceLoading,
		isDevDonationModalOpen,
		setIsDevDonationModalOpen,
		devDonationAmount,
		setDevDonationAmount,
		handleDevDonation,
	} = useDonationLogic();
	const {
		history,
		setHistory,
		isHistoryModalOpen,
		setIsHistoryModalOpen,
		isLoading: historyLoading,
		error: historyError,
		refetchHistory,
	} = useTransactionHistory(address);
	const { ethBalance, usdcBalance, usdtBalance } = useWalletBalance();
	const [isDarkMode, setIsDarkMode] = useState(() => {
		// Inicializa isDarkMode com base no localStorage
		if (typeof window !== "undefined") {
			const savedTheme = localStorage.getItem("theme");
			return savedTheme === "dark";
		}
		return false; // Tema claro como padrão
	});
	const [filterCause, setFilterCause] = useState("");
	const [filterCurrency, setFilterCurrency] = useState("");
	const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

	// Salva a preferência de tema no localStorage sempre que isDarkMode mudar
	useEffect(() => {
		localStorage.setItem("theme", isDarkMode ? "dark" : "light");
	}, [isDarkMode]);

	const notifyOnWarpcast = () => {
		if (!lastDonation) return;
		const causeName = isCustomMode ? "Custom Cause" : cause;
		const shareText = encodeURIComponent(
			`I just donated ${lastDonation.value} ${lastDonation.currency} to the ${causeName} cause using Onchain Donation! 🎉 Check it out at https://donation-agent.vercel.app`,
		);
		window.open(`https://warpcast.com/~/compose?text=${shareText}`, "_blank");
	};

	useEffect(() => {
		if (transactionStatus === "Confirmed" && lastDonation?.currency === "ETH") {
			setIsDevDonationModalOpen(true);
		}
	}, [transactionStatus, lastDonation, setIsDevDonationModalOpen]);

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-300"
			style={{
				backgroundImage: `url(${isDarkMode ? "/img/12.png" : "/img/10.png"})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundAttachment: "fixed",
			}}
		>
			<style jsx global>{`
				@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
				body {
					font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
						Roboto, sans-serif;
				}
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fade-in {
					animation: fadeIn 0.5s ease-out;
				}
				@keyframes slideIn {
					from {
						transform: translateY(20px);
						opacity: 0;
					}
					to {
						transform: translateY(0);
						opacity: 1;
					}
				}
				.animate-slide-in {
					animation: slideIn 0.3s ease-out;
				}
			`}</style>

			<div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center space-y-6 animate-fade-in">
				<button
					onClick={() => setIsDarkMode(!isDarkMode)}
					className="mb-6 p-3 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 hover:scale-105"
					aria-label={
						isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
					}
				>
					{isDarkMode ? "☀️" : "🌙"}
				</button>

				<h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold mb-8 text-white leading-snug tracking-tighter drop-shadow-xl max-w-full text-center flex flex-col sm:flex-row sm:items-center sm:space-x-2">
					Onchain
					<span className="block sm:inline">Donation</span>
				</h1>

				<WalletConnection
					onConnect={(addr) => {
						console.log("Connected:", addr);
					}}
				/>

				{address && (
					<div className="text-base font-medium mb-8 text-center flex items-center justify-center gap-3 text-white drop-shadow-md w-full flex-wrap">
						<p>
							ETH:{" "}
							{parseFloat(ethBalance?.formatted || "0").toLocaleString(
								"en-US",
								{
									minimumFractionDigits: 0,
									maximumFractionDigits: 6,
								},
							)}{" "}
							| USDC:{" "}
							{parseFloat(usdcBalance?.formatted || "0").toLocaleString(
								"en-US",
								{
									minimumFractionDigits: 0,
									maximumFractionDigits: 2,
								},
							)}{" "}
							| USDT:{" "}
							{parseFloat(usdtBalance?.formatted || "0").toLocaleString(
								"en-US",
								{
									minimumFractionDigits: 0,
									maximumFractionDigits: 2,
								},
							)}
						</p>
					</div>
				)}

				<DonationForm
					amount={amount}
					setAmount={setAmount}
					currency={currency}
					setCurrency={setCurrency}
					cause={cause}
					setCause={setCause}
					isCustomMode={isCustomMode}
					setIsCustomMode={setIsCustomMode}
					customCommand={customCommand}
					setCustomCommand={setCustomCommand}
					isCommandValid={isCommandValid}
					setIsCommandValid={setIsCommandValid}
					handleSubmit={handleSubmit}
					isLoading={isLoading}
					isEthBalanceLoading={isEthBalanceLoading}
					isUsdcBalanceLoading={isUsdcBalanceLoading}
					isUsdtBalanceLoading={isUsdtBalanceLoading}
					isDarkMode={isDarkMode}
				/>

				<MessageDisplay message={message} />
				{message && transactionStatus === "Confirmed" && (
					<div className="mt-4 flex justify-center gap-3 flex-wrap">
						<button
							onClick={notifyOnWarpcast}
							className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="Share on Warpcast"
						>
							Warpcast
						</button>
						<button
							onClick={() => setIsHistoryModalOpen(true)}
							className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="View Transactions"
						>
							Transactions
						</button>
						<button
							onClick={() => setIsStatsModalOpen(true)}
							className="px-4 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="View Statistics"
						>
							<span className="flex items-center gap-2">
								<FaChartBar /> Statistics
							</span>
						</button>
						{historyError && (
							<button
								onClick={refetchHistory}
								className="px-4 py-2 rounded-lg bg-yellow-500/80 hover:bg-yellow-600/80 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500"
								aria-label="Refetch History"
							>
								<span className="flex items-center gap-2">
									<FaSyncAlt /> Refetch
								</span>
							</button>
						)}
					</div>
				)}

				{address && historyLoading && (
					<p className="text-white text-center">
						Loading transaction history...
					</p>
				)}
				{historyError && !historyLoading && (
					<p className="text-red-500 text-center">{historyError}</p>
				)}

				<TransactionHistory
					history={history}
					setHistory={setHistory}
					isHistoryModalOpen={isHistoryModalOpen}
					setIsHistoryModalOpen={setIsHistoryModalOpen}
				/>
				<StatsModal
					isStatsModalOpen={isStatsModalOpen}
					setIsStatsModalOpen={setIsStatsModalOpen}
					filterCause={filterCause}
					setFilterCause={setFilterCause}
					filterCurrency={filterCurrency}
					setFilterCurrency={setFilterCurrency}
				/>
				<DevDonationModal
					isDevDonationModalOpen={isDevDonationModalOpen}
					setIsDevDonationModalOpen={setIsDevDonationModalOpen}
					devDonationAmount={devDonationAmount}
					setDevDonationAmount={setDevDonationAmount}
					setMessage={setMessage}
					onConfirm={handleDevDonation}
				/>
			</div>
		</div>
	);
}
