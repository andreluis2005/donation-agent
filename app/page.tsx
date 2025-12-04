// app/page.tsx
//novas atualizaçoes
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	FaBitcoin,
	FaInstagram,
	FaPlayCircle,
	FaCheckCircle,
	FaDonate,
	FaChartBar,
	FaSyncAlt,
	FaFacebook,
	FaTimes,
} from "react-icons/fa";
import WalletConnection from "./components/WalletConnection";
import DonationForm from "./components/DonationForm";
import TransactionHistory from "./components/TransactionHistory";
import StatsModal from "./components/StatsModal";
import DevDonationModal from "./components/DevDonationModal";
import MessageDisplay from "./components/MessageDisplay";
import { useDonationLogic } from "./hooks/useDonationLogic";
import { useTransactionHistory } from "./hooks/useTransactionHistory";
import { useWalletBalance } from "./hooks/useWalletBalance";
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
		isDevDonationModalOpen,
		setIsDevDonationModalOpen,
		devDonationAmount,
		setDevDonationAmount,
		handleDevDonation,
	} = useDonationLogic();
	const {
		isHistoryModalOpen,
		setIsHistoryModalOpen,
		isLoading: historyLoading,
		error: historyError,
		refetchHistory,
	} = useTransactionHistory(address);
	const { ethBalance } = useWalletBalance();
	const [filterCause, setFilterCause] = useState("");
	const [filterCurrency, setFilterCurrency] = useState("");
	const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
	const [clientAddress, setClientAddress] = useState<string | undefined>(
		undefined,
	);
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	// Sincroniza endereço no cliente após a hidratação
	useEffect(() => {
		setClientAddress(address);
	}, [address]);

	// Força currency como ETH para evitar USDC/USDT
	useEffect(() => {
		setCurrency("ETH");
	}, [setCurrency]);

	const notifyOnWarpcast = () => {
		if (!lastDonation || !lastDonation.txHash) return;
		const causeName = lastDonation.cause;
		const shareText = encodeURIComponent(
			`I donated ${lastDonation.value} ETH to ${causeName} on Base! 🎉 Tx: https://basescan.org/tx/${lastDonation.txHash} See: https://onchaindonation.vercel.app/img/doacao.png Visit: https://onchaindonation.vercel.app/ #OnchainSummer`,
		);
		window.open(`https://warpcast.com/~/compose?text=${shareText}`, "_blank");
	};

	useEffect(() => {
		if (transactionStatus === "Confirmed" && lastDonation?.currency === "ETH") {
			setIsDevDonationModalOpen(true);
		}
	}, [transactionStatus, lastDonation, setIsDevDonationModalOpen]);

	const openImageModal = (imageSrc: string) => {
		setSelectedImage(imageSrc);
		setIsImageModalOpen(true);
	};

	const closeImageModal = () => {
		setSelectedImage(null);
		setIsImageModalOpen(false);
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-100 transition-all duration-300">
			<style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }
        .hero-title {
          text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.7);
        }
        .hero-description {
          text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.6);
        }
        .hero-button-shadow {
          box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.7);
        }
      `}</style>

			{/* Fixed Navigation */}
			<nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
				<div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
					<h1 className="text-xl font-bold text-blue-600">Onchain Donation</h1>
					<div className="flex items-center gap-6">
						<Link
							href="#how-it-works"
							className="text-gray-600 hover:text-blue-600 transition-all duration-300"
							aria-label="How It Works Section"
						>
							How It Works
						</Link>
						<Link
							href="#why-onchain"
							className="text-gray-600 hover:text-blue-600 transition-all duration-300"
							aria-label="Why Onchain Section"
						>
							Why Onchain?
						</Link>
						<Link
							href="#donation-section"
							className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="Donate with Crypto"
						>
							<FaDonate className="mr-2" />
							Donate Now
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section
				id="hero"
				className="relative flex flex-col items-center justify-center h-screen text-center px-6 sm:px-8 lg:px-12 animate-fade-in"
				style={{
					backgroundImage: `url(/img/doacao.png)`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="absolute inset-0 bg-blue-900/60"></div>
				<div className="relative z-10 max-w-4xl mx-auto">
					<h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight hero-title">
						Empower Change with Crypto
					</h1>
					<p className="text-xl sm:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto hero-description">
						Donate to causes or any wallet using AI-powered tools on the Base
						network.
					</p>
					<Link
						href="#donation-section"
						className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl font-bold rounded-xl transition-all duration-300 shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 animate-pulse-slow hero-button-shadow"
						aria-label="Donate with Crypto"
					>
						<FaBitcoin className="mr-3" />
						Start Donating
					</Link>
				</div>
			</section>

			{/* Social Proof */}
			<section id="impact" className="py-16 px-6 sm:px-8 lg:px-12 bg-white">
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 mb-10">
						Making a Difference, Onchain
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
						<div className="p-8 bg-gray-50 rounded-xl shadow-lg">
							<p className="text-5xl font-bold text-blue-600">750+</p>
							<p className="text-lg text-gray-600 mt-2">Active Donors</p>
						</div>
						<div className="p-8 bg-gray-50 rounded-xl shadow-lg">
							<p className="text-5xl font-bold text-blue-600">$15,000</p>
							<p className="text-lg text-gray-600 mt-2">Donated</p>
						</div>
						<div className="p-8 bg-gray-50 rounded-xl shadow-lg">
							<p className="text-5xl font-bold text-blue-600">4</p>
							<p className="text-lg text-gray-600 mt-2">Supported Causes</p>
						</div>
					</div>
					<div className="mt-16">
						<h3 className="text-3xl font-semibold text-gray-800 mb-8">
							Voices of Impact
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<blockquote className="p-8 bg-gray-50 rounded-xl shadow-lg">
								<p className="text-lg text-gray-600 italic">
									&quot;Onchain Donation made supporting education with crypto
									easy. Transparency builds trust!&quot;
								</p>
								<p className="mt-4 text-gray-800 font-semibold">
									— Global Learning Foundation
								</p>
							</blockquote>
							<blockquote className="p-8 bg-gray-50 rounded-xl shadow-lg">
								<p className="text-lg text-gray-600 italic">
									&quot;I used AI to donate ETH to a friend&apos;s wallet. It
									was simple and transparent!&quot;
								</p>
								<p className="mt-4 text-gray-800 font-semibold">
									— Sarah, Donor
								</p>
							</blockquote>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section
				id="how-it-works"
				className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-100"
			>
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 mb-10">
						Donate in 3 Simple Steps
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
						<div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
							<FaBitcoin className="mx-auto text-5xl text-blue-600 mb-4" />
							<h3 className="text-2xl font-semibold text-gray-800 mb-3">
								Connect Wallet
							</h3>
							<p className="text-gray-600">
								Connect your MetaMask or Coinbase Wallet to the Base network.
							</p>
						</div>
						<div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
							<FaCheckCircle className="mx-auto text-5xl text-blue-600 mb-4" />
							<h3 className="text-2xl font-semibold text-gray-800 mb-3">
								Choose Cause or Wallet
							</h3>
							<p className="text-gray-600">
								Select Education, Health, Environment, or enter a custom wallet
								address.
							</p>
						</div>
						<div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
							<FaDonate className="mx-auto text-5xl text-blue-600 mb-4" />
							<h3 className="text-2xl font-semibold text-gray-800 mb-3">
								Send Crypto
							</h3>
							<p className="text-gray-600">
								Donate ETH instantly with AI support.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Demo Video */}
			<section id="demo" className="py-16 px-6 sm:px-8 lg:px-12 bg-white">
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 mb-10">
						See It in Action
					</h2>
					<div className="relative w-full h-64 sm:h-96 bg-gray-200 rounded-xl overflow-hidden shadow-lg">
						<iframe
							src="https://www.youtube.com/embed/mB7rnGOn1n8"
							title="Onchain Donation Demo"
							frameBorder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							className="w-full h-full"
						></iframe>
					</div>
					<p className="text-lg text-gray-600 mt-6">
						See how easy it is to donate to causes or any wallet!
					</p>
				</div>
			</section>

			{/* Why Donate Onchain? */}
			<section
				id="why-onchain"
				className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-100"
			>
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 mb-10">
						Why Choose Onchain Donations?
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
						<div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 mb-3">
								AI-Powered Donations
							</h3>
							<p className="text-gray-600">
								Use AI to donate to any wallet, like a friend&apos;s, with ease.
							</p>
						</div>
						<div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 mb-3">
								Unmatched Transparency
							</h3>
							<p className="text-gray-600">
								Every donation is recorded on the Base blockchain, fully
								traceable.
							</p>
						</div>
						<div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 mb-3">
								Secure Transactions
							</h3>
							<p className="text-gray-600">
								Powered by audited smart contracts for maximum security.
							</p>
						</div>
						<div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 mb-3">
								Low-Cost Transfers
							</h3>
							<p className="text-gray-600">
								The Base network ensures fast and affordable transactions.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Real Impact */}
			<section
				id="real-impact"
				className="py-16 px-6 sm:px-8 lg:px-12 bg-white"
			>
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 mb-10">
						Real Impact, Lives Transformed
					</h2>
					<p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
						Every donation through Onchain Donation transforms lives and
						strengthens communities. The{" "}
						<span className="font-semibold text-blue-600">Seja Solidário</span>{" "}
						group unites generous hearts to bring hope, care, and dignity to
						those in need. From supporting indigenous communities, your donation
						makes a difference!
					</p>
					<div className="grid grid-cols-1 md:grid-cols-1 gap-8">
						<div
							className="relative rounded-xl overflow-hidden shadow-lg mx-auto max-w-md h-96"
							onClick={() => openImageModal("/img/doacoes-tribu-indio.PNG")}
						>
							<Image
								src="/img/doacoes-tribu-indio.PNG"
								alt="Indigenous community receiving donations"
								width={448}
								height={336}
								className="w-full h-full object-contain aspect-[4/3]"
								priority
							/>
							<div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-6">
								<p className="text-sm font-semibold">
									Support for indigenous communities
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Image Modal */}
			{isImageModalOpen && selectedImage && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
					<div className="relative max-w-4xl max-h-[80vh]">
						<button
							onClick={closeImageModal}
							className="absolute top-4 right-4 text-white text-2xl focus:outline-none"
							aria-label="Close Image Modal"
						>
							<FaTimes />
						</button>
						<Image
							src={selectedImage}
							alt="Enlarged image"
							width={896}
							height={672}
							className="w-full h-full object-contain"
						/>
					</div>
				</div>
			)}

			{/* Secondary CTA */}
			<section className="py-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
				<div className="max-w-5xl mx-auto">
					<h2 className="text-4xl font-bold mb-6">
						Donate to Causes or Any Wallet
					</h2>
					<p className="text-xl mb-10">
						Support impactful causes or send ETH to anyone using AI. Start now!
					</p>
					<Link
						href="#donation-section"
						className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-xl font-bold rounded-xl transition-all duration-300 shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white animate-pulse-slow"
						aria-label="Donate with Crypto"
					>
						<FaDonate className="mr-3" />
						Donate Now
					</Link>
				</div>
			</section>

			{/* Donation Section */}
			<section
				id="donation-section"
				className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-100"
			>
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 mb-10">
						Make Your Donation Now
					</h2>
					<div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center space-y-6 animate-fade-in">
						<WalletConnection
							onConnect={(addr) => {
								console.log("Connected:", addr);
							}}
							isDarkMode={false}
						/>

						{clientAddress && (
							<div className="text-base font-medium mb-8 text-center flex items-center justify-center gap-3 text-gray-800 drop-shadow-md w-full flex-wrap">
								<p>
									ETH:{" "}
									{parseFloat(ethBalance?.formatted || "0").toLocaleString(
										"en-US",
										{
											minimumFractionDigits: 0,
											maximumFractionDigits: 6,
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
							isDarkMode={false}
						/>

						<MessageDisplay message={message} isDarkMode={false} />
						{message && transactionStatus === "Confirmed" && (
							<div className="mt-4 flex justify-center gap-3 flex-wrap">
								<button
									onClick={notifyOnWarpcast}
									className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
									aria-label="Share on Warpcast"
									disabled={!lastDonation || !lastDonation.txHash}
								>
									Warpcast
								</button>
								<button
									onClick={() => setIsHistoryModalOpen(true)}
									className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
									aria-label="View Transactions"
								>
									Transactions
								</button>
								<button
									onClick={() => setIsStatsModalOpen(true)}
									className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
									aria-label="View Global Donations"
								>
									<span className="flex items-center gap-2">
										<FaChartBar /> Global Donations
									</span>
								</button>
								{historyError && (
									<button
										onClick={refetchHistory}
										className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500"
										aria-label="Reload History"
									>
										<span className="flex items-center gap-2">
											<FaSyncAlt /> Reload
										</span>
									</button>
								)}
							</div>
						)}

						{clientAddress && historyLoading && (
							<p className="text-gray-800 text-center">
								Loading transaction history...
							</p>
						)}
						{historyError && !historyLoading && (
							<p className="text-red-500 text-center">{historyError}</p>
						)}

						<TransactionHistory
							isHistoryModalOpen={isHistoryModalOpen}
							setIsHistoryModalOpen={setIsHistoryModalOpen}
							isDarkMode={false}
							address={address}
						/>
						<StatsModal
							isStatsModalOpen={isStatsModalOpen}
							setIsStatsModalOpen={setIsStatsModalOpen}
							filterCause={filterCause}
							setFilterCause={setFilterCause}
							filterCurrency={filterCurrency}
							setFilterCurrency={setFilterCurrency}
							isDarkMode={false}
						/>
						<DevDonationModal
							isDevDonationModalOpen={isDevDonationModalOpen}
							setIsDevDonationModalOpen={setIsDevDonationModalOpen}
							devDonationAmount={devDonationAmount}
							setDevDonationAmount={setDevDonationAmount}
							setMessage={setMessage}
							onConfirm={handleDevDonation}
							isDarkMode={false}
						/>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-10 px-6 sm:px-8 lg:px-12 bg-gray-800 text-gray-300">
				<div className="max-w-5xl mx-auto text-center">
					<p className="text-lg mb-6">
						Proud participant of the{" "}
						<a
							href="https://onchain-summer-awards.devfolio.co"
							className="text-blue-500 hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							Onchain Summer Awards
						</a>
					</p>
					<p className="mb-6">Follow us for impact stories and updates:</p>
					<div className="flex justify-center gap-8 mb-6">
						<a
							href="https://www.instagram.com/projeto_sejasolidario/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-300 hover:text-blue-500 transition-all duration-300"
							aria-label="Follow on Instagram"
						>
							<FaInstagram size={30} />
						</a>
						<a
							href="https://warpcast.com/~/channel/onchain-donation"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-300 hover:text-blue-500 transition-all duration-300"
							aria-label="Follow on Warpcast"
						>
							Warpcast
						</a>
						<a
							href="https://web.facebook.com/amigossolidariosejaumdenos/photos"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-300 hover:text-blue-500 transition-all duration-300"
							aria-label="Follow on Facebook"
						>
							<FaFacebook size={30} />
						</a>
					</div>
					<p className="text-sm">
						&copy; 2025 Onchain Donation. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}






















//fims
