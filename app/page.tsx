// app/page.tsx
//novas atualizaçoes
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	FaBitcoin,
	FaInstagram,
	FaCheckCircle,
	FaDonate,
	FaChartBar,
	FaSyncAlt,
	FaFacebook,
	FaTimes,
	FaSun,
	FaMoon,
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
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "dark") {
			setIsDarkMode(true);
			document.documentElement.classList.add("dark");
		} else if (savedTheme === "light") {
			setIsDarkMode(false);
			document.documentElement.classList.remove("dark");
		} else {
			const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			setIsDarkMode(systemPrefersDark);
			if (systemPrefersDark) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		}
	}, []);

	const toggleDarkMode = () => {
		const newTheme = !isDarkMode;
		setIsDarkMode(newTheme);
		if (newTheme) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

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

	//const
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
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [impactCounts, setImpactCounts] = useState({ families: 0, volunteers: 0, missions: 0, donated: 0 });
	const [impactVisible, setImpactVisible] = useState(false);

	// Sincroniza endereço no cliente após a hidratação
	useEffect(() => {
		setClientAddress(address);
	}, [address]);

	// Força currency como ETH para evitar USDC/USDT mas breve vou alterar
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

	const carouselImages = [
		{ src: "/img/doacoes-tribu-indio.PNG", caption: "Seja Solidário team supporting indigenous communities", label: "Indigenous Communities" },
		{ src: "/img/idoso.PNG", caption: "Care and dignity for the elderly", label: "Elderly Care" },
		{ src: "/img/1.jpg", caption: "Children receiving food and support", label: "Food Security" },
		{ src: "/img/5.jpg", caption: "Children playing and smiling thanks to your donations", label: "Education & Joy" },
	];

	const prevSlide = () => setCarouselIndex((i) => (i === 0 ? carouselImages.length - 1 : i - 1));
	const nextSlide = () => setCarouselIndex((i) => (i === carouselImages.length - 1 ? 0 : i + 1));

	useEffect(() => {
		if (!impactVisible) return;
		const targets = { families: 1200, volunteers: 85, missions: 23, donated: 80 };
		const duration = 1800;
		const steps = 60;
		const interval = duration / steps;
		let step = 0;
		const timer = setInterval(() => {
			step++;
			const progress = step / steps;
			const ease = 1 - Math.pow(1 - progress, 3);
			setImpactCounts({
				families: Math.round(targets.families * ease),
				volunteers: Math.round(targets.volunteers * ease),
				missions: Math.round(targets.missions * ease),
				donated: Math.round(targets.donated * ease),
			});
			if (step >= steps) clearInterval(timer);
		}, interval);
		return () => clearInterval(timer);
	}, [impactVisible]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCarouselIndex((i) => (i === carouselImages.length - 1 ? 0 : i + 1));
		}, 4500);
		return () => clearInterval(interval);
	}, [carouselImages.length]);

	return (
		<div className="flex flex-col min-h-screen bg-gray-100 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
        @keyframes countUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-count-up {
          animation: countUp 0.6s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .carousel-slide {
          animation: slideIn 0.45s ease-out;
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .impact-gradient-text {
          background: linear-gradient(90deg, #3b82f6, #6366f1, #3b82f6);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .testimonial-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
        }
      `}</style>

			{/* Fixed Navigation */}
			<nav className="fixed top-0 left-0 w-full bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md shadow-md z-50 border-b border-gray-200/50 dark:border-white/5 transition-all duration-300">
				<div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
					<h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Onchain Donation</h1>
					<div className="flex items-center gap-4 sm:gap-6">
						<Link
							href="#how-it-works"
							className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm sm:text-base transition-all duration-300"
							aria-label="How It Works Section"
						>
							How It Works
						</Link>
						<Link
							href="#why-onchain"
							className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm sm:text-base transition-all duration-300"
							aria-label="Why Onchain Section"
						>
							Why Onchain?
						</Link>
						<button
							onClick={toggleDarkMode}
							className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
							aria-label="Toggle Theme"
						>
							{isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
						</button>
						<Link
							href="#donation-section"
							className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
							aria-label="Donate with Crypto"
						>
							<FaDonate className="mr-1 sm:mr-2" />
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
				<div className="absolute inset-0 bg-blue-900/60 dark:bg-[#0B0F19]/80"></div>
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
			<section id="impact" className="py-16 px-6 sm:px-8 lg:px-12 bg-white dark:bg-[#0D1321] border-b border-gray-200/50 dark:border-white/5 transition-colors duration-300">
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-10">
						Making a Difference, Onchain
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
						<div className="p-8 bg-gray-50 dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg backdrop-blur-sm transition-colors duration-300">
							<p className="text-5xl font-bold text-blue-600 dark:text-blue-400">750+</p>
							<p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Active Donors</p>
						</div>
						<div className="p-8 bg-gray-50 dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg backdrop-blur-sm transition-colors duration-300">
							<p className="text-5xl font-bold text-blue-600 dark:text-blue-400">$15,000</p>
							<p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Donated</p>
						</div>
						<div className="p-8 bg-gray-50 dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg backdrop-blur-sm transition-colors duration-300">
							<p className="text-5xl font-bold text-blue-600 dark:text-blue-400">4</p>
							<p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Supported Causes</p>
						</div>
					</div>
					<div className="mt-16">
						<h3 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-8">
							Voices of Impact
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<blockquote className="p-8 bg-gray-50 dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg backdrop-blur-sm text-left transition-colors duration-300">
								<p className="text-lg text-gray-600 dark:text-gray-300 italic">
									&quot;Onchain Donation made supporting education with crypto
									easy. Transparency builds trust!&quot;
								</p>
								<p className="mt-4 text-gray-800 dark:text-gray-200 font-semibold">
									— Global Learning Foundation
								</p>
							</blockquote>
							<blockquote className="p-8 bg-gray-50 dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg backdrop-blur-sm text-left transition-colors duration-300">
								<p className="text-lg text-gray-600 dark:text-gray-300 italic">
									&quot;I used AI to donate ETH to a friend&apos;s wallet. It
									was simple and transparent!&quot;
								</p>
								<p className="mt-4 text-gray-800 dark:text-gray-200 font-semibold">
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
				className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-100 dark:bg-[#0B0F19] transition-colors duration-300"
			>
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-10">
						Donate in 3 Simple Steps
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
						<div className="p-8 bg-white dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg hover:shadow-xl dark:hover:border-blue-500/30 transition-all duration-300">
							<FaBitcoin className="mx-auto text-5xl text-blue-600 dark:text-blue-400 mb-4" />
							<h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
								Connect Wallet
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Connect your MetaMask or Coinbase Wallet to the Base network.
							</p>
						</div>
						<div className="p-8 bg-white dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg hover:shadow-xl dark:hover:border-blue-500/30 transition-all duration-300">
							<FaCheckCircle className="mx-auto text-5xl text-blue-600 dark:text-blue-400 mb-4" />
							<h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
								Choose Cause or Wallet
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Select Education, Health, Environment, or enter a custom wallet
								address.
							</p>
						</div>
						<div className="p-8 bg-white dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg hover:shadow-xl dark:hover:border-blue-500/30 transition-all duration-300">
							<FaDonate className="mx-auto text-5xl text-blue-600 dark:text-blue-400 mb-4" />
							<h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
								Send Crypto
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Donate ETH instantly with AI support.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Demo Video */}
			<section id="demo" className="py-16 px-6 sm:px-8 lg:px-12 bg-white dark:bg-[#0D1321] transition-colors duration-300">
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-10">
						See It in Action
					</h2>
					<div className="relative w-full h-64 sm:h-96 bg-gray-200 dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border dark:border-white/5">
						<iframe
							src="https://www.youtube.com/embed/mB7rnGOn1n8"
							title="Onchain Donation Demo"
							frameBorder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							className="w-full h-full"
						></iframe>
					</div>
					<p className="text-lg text-gray-600 dark:text-gray-300 mt-6">
						See how easy it is to donate to causes or any wallet!
					</p>
				</div>
			</section>

			{/* Why Donate Onchain? */}
			<section
				id="why-onchain"
				className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-100 dark:bg-[#0B0F19] transition-colors duration-300"
			>
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-10">
						Why Choose Onchain Donations?
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
						<div className="p-8 bg-white dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg hover:shadow-xl dark:hover:border-blue-500/30 transition-all duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
								AI-Powered Donations
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Use AI to donate to any wallet, like a friend&apos;s, with ease.
							</p>
						</div>
						<div className="p-8 bg-white dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg hover:shadow-xl dark:hover:border-blue-500/30 transition-all duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
								Unmatched Transparency
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Every donation is recorded on the Base blockchain, fully
								traceable.
							</p>
						</div>
						<div className="p-8 bg-white dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg hover:shadow-xl dark:hover:border-blue-500/30 transition-all duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
								Secure Transactions
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Powered by audited smart contracts for maximum security.
							</p>
						</div>
						<div className="p-8 bg-white dark:bg-slate-900/40 dark:border dark:border-white/5 rounded-xl shadow-lg hover:shadow-xl dark:hover:border-blue-500/30 transition-all duration-300">
							<h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
								Low-Cost Transfers
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								The Base network ensures fast and affordable transactions.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Real Impact */}
			<section
				id="real-impact"
				className="py-20 px-6 sm:px-8 lg:px-12 bg-white dark:bg-[#0D1321] transition-colors duration-300 overflow-hidden"
			>
				<div className="max-w-6xl mx-auto">

					{/* Header */}
					<div className="text-center mb-14">
						<span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-4 tracking-wide uppercase">
							✦ Seja Solidário
						</span>
						<h2 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white mb-5 leading-tight">
							Real Impact,{" "}
							<span className="impact-gradient-text">Lives Transformed</span>
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							Every donation through Onchain Donation brings real change.
							The <span className="font-semibold text-blue-600 dark:text-blue-400">Seja Solidário</span> group
							unites generous hearts to bring hope, care, and dignity to indigenous communities,
							the elderly, and children in need.
						</p>
					</div>

					{/* Impact Metrics */}
					<div
						ref={(el) => {
							if (el && !impactVisible) {
								const observer = new IntersectionObserver(
									([entry]) => { if (entry.isIntersecting) { setImpactVisible(true); observer.disconnect(); } },
									{ threshold: 0.3 }
								);
								observer.observe(el);
							}
						}}
						className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16"
					>
						{[
							{ value: `${impactCounts.families.toLocaleString()}+`, label: "Families Helped", icon: "🏡" },
							{ value: `${impactCounts.volunteers}+`, label: "Volunteers", icon: "🤝" },
							{ value: `${impactCounts.missions}`, label: "Missions Completed", icon: "🌍" },
							{ value: `R$${impactCounts.donated}k+`, label: "In Donations", icon: "💙" },
						].map((metric) => (
							<div
								key={metric.label}
								className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-indigo-800/30 text-center shadow-sm hover:shadow-md transition-all duration-300"
							>
								<div className="text-3xl mb-2">{metric.icon}</div>
								<div className={`text-3xl font-extrabold text-blue-600 dark:text-blue-400 ${impactVisible ? 'animate-count-up' : 'opacity-0'}`}>
									{metric.value}
								</div>
								<div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{metric.label}</div>
							</div>
						))}
					</div>

					{/* Carousel + Testimonials Side by Side */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 items-center">

						{/* Carousel */}
						<div className="relative rounded-2xl overflow-hidden shadow-2xl group" style={{ minHeight: '360px' }}>
							<div
								key={carouselIndex}
								className="carousel-slide relative w-full h-[360px] cursor-pointer"
								onClick={() => openImageModal(carouselImages[carouselIndex].src)}
							>
								<Image
									src={carouselImages[carouselIndex].src}
									alt={carouselImages[carouselIndex].caption}
									fill
									className="object-cover"
									priority
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
								<div className="absolute bottom-0 left-0 right-0 p-5">
									<span className="inline-block px-3 py-1 bg-blue-600/80 text-white text-xs font-bold rounded-full mb-2">
										{carouselImages[carouselIndex].label}
									</span>
									<p className="text-white text-sm font-medium leading-snug">
										{carouselImages[carouselIndex].caption}
									</p>
								</div>
							</div>

							{/* Arrows */}
							<button
								onClick={(e) => { e.stopPropagation(); prevSlide(); }}
								className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
								aria-label="Previous image"
							>
								‹
							</button>
							<button
								onClick={(e) => { e.stopPropagation(); nextSlide(); }}
								className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
								aria-label="Next image"
							>
								›
							</button>

							{/* Dots */}
							<div className="absolute bottom-16 right-4 flex gap-1.5">
								{carouselImages.map((_, i) => (
									<button
										key={i}
										onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); }}
										className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none ${
											i === carouselIndex ? 'bg-white scale-125' : 'bg-white/50'
										}`}
										aria-label={`Go to slide ${i + 1}`}
									/>
								))}
							</div>
						</div>

						{/* Testimonials */}
						<div className="flex flex-col gap-5">
							{[
								{
									quote: "\"The Seja Solidário team arrived at our village with food, medicine, and smiles. We felt seen and cared for — a feeling we hadn't had in years.\"",
									author: "Maria, indigenous community leader",
									emoji: "🌿",
								},
								{
									quote: "\"I never imagined that a crypto donation could change my grandmother's life. The volunteers came weekly with food and company.\"",
									author: "Carlos, donor & volunteer",
									emoji: "💙",
								},
								{
									quote: "\"Every ETH donated goes directly to the mission. Blockchain transparency gave us confidence that our contribution truly reaches those who need it.\"",
									author: "Ana, monthly donor",
									emoji: "⛓️",
								},
							].map((t) => (
								<blockquote
									key={t.author}
									className="testimonial-card p-5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-white/5 rounded-2xl shadow-sm"
								>
									<p className="text-gray-600 dark:text-gray-300 italic text-sm leading-relaxed mb-3">
										{t.quote}
									</p>
									<p className="text-gray-800 dark:text-gray-200 font-semibold text-sm flex items-center gap-2">
										<span>{t.emoji}</span> — {t.author}
									</p>
								</blockquote>
							))}
						</div>
					</div>

					{/* CTA emocional */}
					<div className="text-center mt-4">
						<p className="text-gray-500 dark:text-gray-400 text-base mb-5">
							Your donation — however small — can be someone's turning point.
						</p>
						<Link
							href="#donation-section"
							className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500"
							aria-label="Be part of this story"
						>
							<FaDonate />
							Be part of this story → Donate Now
						</Link>
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
			<section className="py-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white text-center">
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
				className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-100 dark:bg-[#0B0F19] transition-colors duration-300"
			>
				<div className="max-w-5xl mx-auto text-center">
					<h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-10">
						Make Your Donation Now
					</h2>
					<div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center space-y-6 animate-fade-in">
						<WalletConnection
							onConnect={(addr) => {
								console.log("Connected:", addr);
							}}
							isDarkMode={isDarkMode}
						/>

						{clientAddress && (
							<div className="text-base font-medium mb-8 text-center flex items-center justify-center gap-3 text-gray-800 dark:text-gray-200 drop-shadow-md w-full flex-wrap">
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
							isDarkMode={isDarkMode}
						/>

						<MessageDisplay message={message} isDarkMode={isDarkMode} />
						{message && transactionStatus === "Confirmed" && (
							<div className="mt-4 flex justify-center gap-3 flex-wrap">
								<button
									onClick={notifyOnWarpcast}
									className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
									aria-label="Share on Warpcast"
									disabled={!lastDonation || !lastDonation.txHash}
								>
									Warpcast
								</button>
								<button
									onClick={() => setIsHistoryModalOpen(true)}
									className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
									aria-label="View Transactions"
								>
									Transactions
								</button>
								<button
									onClick={() => setIsStatsModalOpen(true)}
									className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
							<p className="text-gray-800 dark:text-gray-200 text-center">
								Loading transaction history...
							</p>
						)}
						{historyError && !historyLoading && (
							<p className="text-red-500 dark:text-red-400 text-center">{historyError}</p>
						)}

						<TransactionHistory
							isHistoryModalOpen={isHistoryModalOpen}
							setIsHistoryModalOpen={setIsHistoryModalOpen}
							isDarkMode={isDarkMode}
							address={address}
						/>
						<StatsModal
							isStatsModalOpen={isStatsModalOpen}
							setIsStatsModalOpen={setIsStatsModalOpen}
							filterCause={filterCause}
							setFilterCause={setFilterCause}
							filterCurrency={filterCurrency}
							setFilterCurrency={setFilterCurrency}
							isDarkMode={isDarkMode}
						/>
						<DevDonationModal
							isDevDonationModalOpen={isDevDonationModalOpen}
							setIsDevDonationModalOpen={setIsDevDonationModalOpen}
							devDonationAmount={devDonationAmount}
							setDevDonationAmount={setDevDonationAmount}
							setMessage={setMessage}
							onConfirm={handleDevDonation}
							isDarkMode={isDarkMode}
						/>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-10 px-6 sm:px-8 lg:px-12 bg-gray-800 dark:bg-slate-950 text-gray-300 dark:text-gray-400 border-t border-gray-700/50 dark:border-white/5 transition-colors duration-300">
				<div className="max-w-5xl mx-auto text-center">
					<p className="text-lg mb-6">
						Proud participant of the{" "}
						<a
							href="https://onchain-summer-awards.devfolio.co"
							className="text-blue-500 dark:text-blue-400 hover:underline"
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
							className="text-gray-300 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
							aria-label="Follow on Instagram"
						>
							<FaInstagram size={30} />
						</a>
						<a
							href="https://warpcast.com/~/channel/onchain-donation"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-300 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
							aria-label="Follow on Warpcast"
						>
							Warpcast
						</a>
						<a
							href="https://web.facebook.com/amigossolidariosejaumdenos/photos"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-300 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300"
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
