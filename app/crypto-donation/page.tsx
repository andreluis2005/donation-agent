"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useMiniKit, useOpenUrl } from "@coinbase/onchainkit/minikit";
import {
	useAccount,
	useSendTransaction,
	useDisconnect,
	useContractWrite,
	useBalance,
	useConnect,
} from "wagmi";
import { parseEther, isAddress } from "viem";
import {
	FaCheckCircle,
	FaPlug,
	FaExclamationCircle,
	FaChartBar,
	FaWallet,
	FaTimes,
} from "react-icons/fa";
import { RiLoader4Line } from "react-icons/ri";
import DonationModal from "../../components/DonationModal";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { supabase } from "../../lib/supabase";

// Registrar componentes do Chart.js
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

// Define o erc20ABI manualmente
const erc20ABI = [
	{
		constant: false,
		inputs: [
			{ name: "_to", type: "address" },
			{ name: "_value", type: "uint256" },
		],
		name: "transfer",
		outputs: [{ name: "", type: "bool" }],
		type: "function",
	},
	{
		constant: true,
		inputs: [{ name: "_owner", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "balance", type: "uint256" }],
		type: "function",
	},
	{
		constant: true,
		inputs: [],
		name: "decimals",
		outputs: [{ name: "", type: "uint8" }],
		type: "function",
	},
];

// Função para validar endereços Ethereum
const validateAddress = (addr: string): string => {
	if (!isAddress(addr)) {
		throw new Error(`Invalid address: ${addr}`);
	}
	return addr;
};

export default function Home() {
	const { setFrameReady, isFrameReady } = useMiniKit();
	const openUrl = useOpenUrl();
	const { address, chainId } = useAccount();
	const { connect, connectors, isPending: isConnecting } = useConnect();
	const { sendTransactionAsync } = useSendTransaction();
	const { disconnect } = useDisconnect();
	const { writeAsync: transferTokenAsync } = useContractWrite({
		address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Contrato USDC na Base Sepolia
		abi: erc20ABI,
		functionName: "transfer",
	});
	const { writeAsync: transferUsdtAsync } = useContractWrite({
		address: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2", // Contrato USDT na Base Sepolia
		abi: erc20ABI,
		functionName: "transfer",
	});

	// Verificação de saldo
	const { data: ethBalance, isLoading: isEthBalanceLoading } = useBalance({
		address,
	});
	const { data: usdcBalance, isLoading: isUsdcBalanceLoading } = useBalance({
		address,
		token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
	});
	const { data: usdtBalance, isLoading: isUsdtBalanceLoading } = useBalance({
		address,
		token: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
	});

	const causeAddressMap = {
		education: "0xCaE3E92B39a1965A4B98bE34470Fdc1f49279e6",
		health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
		environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
		social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
	};

	const causeNameMap = {
		education: "Education",
		health: "Health",
		environment: "Environment",
		social: "Social Impact",
	};

	const [amount, setAmount] = useState("");
	const [currency, setCurrency] = useState("ETH");
	const [cause, setCause] = useState("education");
	const [customCommand, setCustomCommand] = useState("");
	const [isCustomMode, setIsCustomMode] = useState(false);
	const [message, setMessage] = useState<JSX.Element | string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [history, setHistory] = useState<any[]>([]);
	const [transactionStatus, setTransactionStatus] = useState("");
	const [isCommandValid, setIsCommandValid] = useState<boolean>(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
	const [lastDonation, setLastDonation] = useState<{
		value: string;
		currency: string;
		toAddress: string;
		cause: string;
	} | null>(null);
	const [resolveModal, setResolveModal] = useState<
		((value: boolean | string) => void) | null
	>(null);
	const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
	const [connectingConnectorId, setConnectingConnectorId] = useState<
		string | null
	>(null);
	const [page, setPage] = useState(1); // Adicionado para paginação
	const pageSize = 10; // Tamanho da página
	const [isDevDonationModalOpen, setIsDevDonationModalOpen] = useState(false); // Novo estado para modal de doação ao desenvolvedor
	const [devDonationAmount, setDevDonationAmount] = useState(""); // Valor da doação ao desenvolvedor
	const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false); // Novo estado para confirmação de exclusão

	// Novos estados para filtros
	const [filterCause, setFilterCause] = useState("");
	const [filterCurrency, setFilterCurrency] = useState("");

	// Filtrar e ordenar conectores
	const uniqueConnectors = useMemo(() => {
		const seenNames = new Set<string>();
		const prioritizedConnectors = connectors.reduce(
			(acc, connector) => {
				const connectorName = connector.name.toLowerCase();
				if (connectorName.includes("metamask")) {
					if (!seenNames.has("metamask")) {
						seenNames.add("metamask");
						acc.push({ ...connector, name: "MetaMask" });
					}
				} else if (!seenNames.has(connectorName)) {
					seenNames.add(connectorName);
					acc.push(connector);
				}
				return acc;
			},
			[] as typeof connectors,
		);
		return prioritizedConnectors.sort((a, b) => a.name.localeCompare(b.name));
	}, [connectors]);

	// Cache local e paginação
	useEffect(() => {
		async function fetchDonations() {
			if (!address) return;
			const { data, error } = await supabase
				.from("donations")
				.select("*")
				.eq("user_address", address)
				.range((page - 1) * pageSize, page * pageSize - 1)
				.order("created_at", { ascending: false });
			if (error) {
				console.error("Erro ao buscar doações:", error.message);
				return;
			}
			setHistory((prev) =>
				page === 1 ? data || [] : [...prev, ...(data || [])],
			);
		}
		fetchDonations();
	}, [address, page]);

	// Placeholder dinâmico
	const amountPlaceholder = useMemo(() => {
		return currency === "ETH" ? "0.001" : currency === "USDC" ? "10" : "10";
	}, [currency]);

	// Função para processar estatísticas
	const getStatsData = () => {
		type CauseKey = keyof typeof causeAddressMap;
		const stats: Record<CauseKey, { ETH: number; USDC: number; USDT: number }> =
			{
				education: { ETH: 0, USDC: 0, USDT: 0 },
				health: { ETH: 0, USDC: 0, USDT: 0 },
				environment: { ETH: 0, USDC: 0, USDT: 0 },
				social: { ETH: 0, USDC: 0, USDT: 0 },
			};

		history.forEach((entry) => {
			const causeKey = (Object.keys(causeAddressMap) as CauseKey[]).find(
				(key) =>
					causeAddressMap[key].toLowerCase() === entry.to_address.toLowerCase(),
			) as CauseKey | undefined;
			if (
				causeKey &&
				stats[causeKey] &&
				["ETH", "USDC", "USDT"].includes(entry.currency)
			) {
				stats[causeKey][entry.currency as keyof (typeof stats)[CauseKey]] +=
					parseFloat(entry.amount);
			}
		});

		return stats;
	};

	// Função para filtrar estatísticas
	const filteredStats = useMemo(() => {
		const stats = getStatsData();
		const filtered: {
			cause: string;
			ETH: number;
			USDC: number;
			USDT: number;
		}[] = [];

		const causes = filterCause
			? [filterCause]
			: ["education", "health", "environment", "social"];
		const currencies = filterCurrency
			? [filterCurrency]
			: ["ETH", "USDC", "USDT"];

		causes.forEach((cause) => {
			const entry = {
				cause: causeNameMap[cause as keyof typeof causeNameMap],
				ETH: 0,
				USDC: 0,
				USDT: 0,
			};
			currencies.forEach((currency) => {
				entry[currency as keyof typeof entry] =
					stats[cause as keyof typeof stats][
						currency as keyof (typeof stats)[keyof typeof stats]
					];
			});
			filtered.push(entry);
		});

		return filtered;
	}, [filterCause, filterCurrency, getStatsData]);

	// Função para exportar para CSV
	const exportToCSV = () => {
		const csv = [
			["Cause", "ETH", "USDC", "USDT"].join(","),
			...filteredStats.map((stat) =>
				[
					stat.cause,
					stat.ETH.toFixed(4),
					stat.USDC.toFixed(2),
					stat.USDT.toFixed(2),
				].join(","),
			),
		].join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "donation_statistics.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	useEffect(() => {
		if (!isFrameReady) {
			setFrameReady();
			console.log("Minikit frame set as ready");
		}
	}, [isFrameReady, setFrameReady]);

	useEffect(() => {
		if (isCustomMode) {
			const isValid = customCommand.match(
				/Donate\s+(\d+\.?\d*)\s+(ETH|USDC|USDT)\s+to\s+(0x[a-fA-F0-9]{40}|education|health|environment|social)/i,
			);
			setIsCommandValid(!!isValid);
		} else {
			const isValid =
				!!amount.match(/^\d+\.?\d*$/) && parseFloat(amount) > 0 && !!cause;
			setIsCommandValid(isValid);
		}
	}, [amount, currency, cause, customCommand, isCustomMode]);

	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (!isWalletMenuOpen) return;
			const key = event.key;
			const index = parseInt(key) - 1;
			if (index >= 0 && index < uniqueConnectors.length) {
				handleConnectWallet(uniqueConnectors[index]);
			}
		},
		[isWalletMenuOpen, uniqueConnectors],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [handleKeyPress]); // Corrigido de [handlePress] para [handleKeyPress]

	const handleConnectWallet = async (connector: any) => {
		setIsLoading(true);
		setConnectingConnectorId(connector.id);
		try {
			await connect({ connector });
			setIsWalletMenuOpen(false);
		} catch (error) {
			console.error("Connection error:", (error as Error).message);
		} finally {
			setIsLoading(false);
			setConnectingConnectorId(null);
		}
	};

	const handleDisconnectWallet = () => {
		disconnect();
		setMessage(
			<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 animate-slide-in">
				<FaCheckCircle /> <p>Wallet disconnected successfully.</p>
			</div>,
		);
	};

	const notifyOnWarpcast = () => {
		if (!lastDonation) return;
		const causeName = isCustomMode ? "Custom Cause" : causeNameMap[cause];
		const shareText = encodeURIComponent(
			`I just donated ${lastDonation.value} ${lastDonation.currency} to the ${causeName} cause using Onchain Donation! 🎉 Check it out at https://donation-agent.vercel.app`,
		);
		openUrl(`https://warpcast.com/~/compose?text=${shareText}`);
	};

	const validateInput = () => {
		if (!address) return "Connect a wallet.";
		if (!isCustomMode && (!amount || parseFloat(amount) <= 0))
			return "Invalid amount.";
		if (isCustomMode && !isCommandValid) return "Invalid command.";
		if (!isCustomMode && !causeAddressMap[cause]) return "Invalid cause.";
		return null;
	};

	const handleSubmit = async () => {
		const error = validateInput();
		if (error) {
			setMessage(
				<div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-slide-in">
					<FaExclamationCircle /> <p>{error}</p>
				</div>,
			);
			return;
		}

		if (isEthBalanceLoading || isUsdcBalanceLoading || isUsdtBalanceLoading) {
			setMessage(
				<div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 animate-slide-in">
					<FaExclamationCircle /> <p>Loading balance, please wait...</p>
				</div>,
			);
			return;
		}

		setMessage("");
		setIsLoading(true);
		setTransactionStatus("Pending");

		let data: {
			value: string;
			toAddress: string;
			currency: string;
			amountInWei?: string;
		} | null = null;

		try {
			if (!isCustomMode) {
				data = {
					value: amount,
					toAddress: causeAddressMap[cause],
					currency: currency.toUpperCase(),
				};
				if (data.currency === "ETH") {
					data.amountInWei = parseEther(data.value).toString();
				}
			} else {
				const command = customCommand;
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 45000);

				const response = await fetch("/api/agent", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ command, donateToDev: false }),
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (response.status !== 200) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				data = await response.json();

				if (data.error) {
					throw new Error(data.error);
				}
			}

			if (data && data.toAddress && data.value && data.currency) {
				validateAddress(data.toAddress);

				const amountToCheck = parseFloat(data.value);
				if (isNaN(amountToCheck) || amountToCheck <= 0) {
					throw new Error("Invalid donation amount");
				}

				const balance =
					data.currency === "ETH"
						? parseFloat(ethBalance?.formatted || "0")
						: data.currency === "USDC"
							? parseFloat(usdcBalance?.formatted || "0")
							: parseFloat(usdtBalance?.formatted || "0");
				if (balance < amountToCheck) {
					throw new Error(
						`Insufficient ${data.currency} balance. Available: ${balance.toFixed(
							4,
						)} ${data.currency}, Required: ${amountToCheck.toFixed(2)} ${data.currency}`,
					);
				}

				// Transação principal
				let txHash: string;
				if (data.currency === "ETH") {
					const tx = await sendTransactionAsync({
						to: data.toAddress,
						value: BigInt(
							data.amountInWei || parseEther(data.value).toString(),
						),
					});
					txHash = tx;
				} else if (data.currency === "USDC") {
					const amountInUnits = parseInt(
						(parseFloat(data.value) * 1e6).toString(),
					);
					const tx = await transferTokenAsync({
						args: [data.toAddress, BigInt(amountInUnits)],
					});
					txHash = tx;
				} else if (data.currency === "USDT") {
					const amountInUnits = parseInt(
						(parseFloat(data.value) * 1e6).toString(),
					);
					const tx = await transferUsdtAsync({
						args: [data.toAddress, BigInt(amountInUnits)],
					});
					txHash = tx;
				}

				// Registro da transação principal
				await fetch("/api/donate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						command: `donate ${data.value} ${data.currency} to ${data.toAddress}`,
						signerData: { address },
						donateToDev: false,
						txHash: txHash,
					}),
				});

				const timestamp = new Date().toLocaleString("en-US", {
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				});
				const historyEntry = {
					user_address: address,
					amount: data.value,
					currency: data.currency,
					to_address: data.toAddress,
					cause,
					dev_donation: 0,
					tx_hash: txHash,
					created_at: timestamp,
				};
				setHistory((prev) => [...prev, historyEntry]);

				// Abrir modal de doação ao desenvolvedor se a transação for em ETH
				if (data.currency === "ETH") {
					setIsDevDonationModalOpen(true);
				}

				setLastDonation({ ...data, cause });
				setMessage(
					<div className="flex flex-col gap-2 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 animate-slide-in">
						<span className="flex items-center gap-2">
							<FaCheckCircle /> Donation sent successfully!
						</span>
						<a
							href={`https://sepolia.basescan.org/tx/${txHash}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm underline"
						>
							Hash: {txHash.slice(0, 10)}...
						</a>
					</div>,
				);
				setTransactionStatus("Confirmed");
				setAmount("");
				setCurrency("ETH");
				setCause("education");
				setCustomCommand("");
			} else {
				throw new Error("Invalid API response");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			console.error("Transaction Error:", errorMessage);
			setMessage(
				<div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-slide-in">
					<FaExclamationCircle /> <p>{`Transaction Error: ${errorMessage}`}</p>
				</div>,
			);
			setTransactionStatus("Failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDevDonation = async (amount: string) => {
		if (!address || !ethBalance) return;

		const devAddress = "0xf2D3CeF68400248C9876f5A281291c7c4603D100";
		validateAddress(devAddress);
		const devAmountInWei = parseEther(amount);

		if (parseFloat(ethBalance?.formatted || "0") < parseFloat(amount)) {
			setMessage(
				<div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-slide-in">
					<FaExclamationCircle />{" "}
					<p>Insufficient ETH balance for developer donation.</p>
				</div>,
			);
			setIsDevDonationModalOpen(false);
			return;
		}

		try {
			setIsLoading(true);
			const txDev = await sendTransactionAsync({
				to: devAddress,
				value: devAmountInWei,
			});
			const devHistoryEntry = {
				user_address: address,
				amount: amount,
				currency: "ETH",
				to_address: devAddress,
				cause: "Developer Donation",
				dev_donation: 0,
				tx_hash: txDev,
				created_at: new Date().toLocaleString("en-US", {
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					hour12: true,
				}),
			};
			setHistory((prev) => [...prev, devHistoryEntry]);
			await fetch("/api/donate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					command: `donate ${amount} ETH to developer`,
					signerData: { address },
					donateToDev: true,
					txHash: txDev,
				}),
			});
			setMessage(
				<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 animate-slide-in">
					<FaCheckCircle /> Developer donation sent successfully!
				</div>,
			);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			setMessage(
				<div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-slide-in">
					<FaExclamationCircle />{" "}
					<p>{`Developer Donation Error: ${errorMessage}`}</p>
				</div>,
			);
		} finally {
			setIsLoading(false);
			setIsDevDonationModalOpen(false);
			setDevDonationAmount("");
		}
	};

	const handleCloseDevModal = () => {
		setIsDevDonationModalOpen(false);
		setDevDonationAmount("");
	};

	const handleClearHistory = () => {
		if (isClearConfirmOpen) {
			setHistory([]);
			setIsClearConfirmOpen(false);
			setMessage(
				<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 animate-slide-in">
					<FaCheckCircle /> History cleared successfully.
				</div>,
			);
		} else {
			setIsClearConfirmOpen(true);
		}
	};

	const handleCancelClear = () => {
		setIsClearConfirmOpen(false);
	};

	return (
		<div
			className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-300"
			style={{
				backgroundImage: `url('/img/10.png')`,
				backgroundSize: "cover",
				backgroundPosition: "center",
				backgroundAttachment: "fixed",
				filter: isDarkMode ? "brightness(0.7)" : "none",
			}}
		>
			<div
				className={`absolute inset-0 z-0 transition-all duration-300 ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-black bg-opacity-50"}`}
			></div>
			<style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
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

				{!address ? (
					<div className="flex flex-col items-center gap-4 w-full">
						<p className="text-lg text-white drop-shadow-md">
							Connect your wallet to start:
						</p>
						<div className="relative">
							<button
								onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
								disabled={isConnecting}
								className={`bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isConnecting ? "opacity-50 cursor-not-allowed" : ""} ${isDarkMode ? "hover:bg-emerald-700" : ""} hover:scale-105`}
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
										className={`w-full max-w-sm p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-200"} border animate-slide-in`}
										tabIndex={-1}
									>
										<h3
											id="wallet-modal-title"
											className="text-xl font-semibold mb-4 text-center"
										>
											Choose your wallet
										</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
											Press 1, 2, 3... to select quickly
										</p>
										<ul className="space-y-2">
											{uniqueConnectors.map((connector, index) => (
												<li key={connector.id}>
													<button
														onClick={() => handleConnectWallet(connector)}
														disabled={isConnecting}
														className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 text-sm transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} ${isConnecting && connectingConnectorId === connector.id ? "opacity-50 cursor-not-allowed" : ""}`}
														aria-label={`Connect with ${connector.name} (Press ${index + 1})`}
													>
														{isConnecting &&
														connectingConnectorId === connector.id ? (
															<RiLoader4Line className="w-6 h-6 animate-spin text-gray-500 dark:text-gray-400" />
														) : (
															<img
																src={`/img/${connector.name.toLowerCase().includes("metamask") ? "metamask" : connector.name.toLowerCase().includes("walletconnect") ? "walletconnect" : connector.name.toLowerCase().includes("coinbase") ? "coinbase" : "wallet"}.png`}
																alt={`${connector.name} icon`}
																className="w-6 h-6"
																onError={(e) =>
																	(e.currentTarget.src = "/img/wallet.png")
																}
															/>
														)}
														<span>{`${index + 1}. ${connector.name}`}</span>
													</button>
												</li>
											))}
										</ul>
										<button
											onClick={() => setIsWalletMenuOpen(false)}
											className={`w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode ? "bg-gray-600 hover:bg-gray-700 text-gray-100" : "bg-gray-200 hover:bg-gray-300 text-gray-900"} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500`}
											aria-label="Close wallet selection modal"
										>
											Close
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				) : (
					<>
						<div className="text-base font-medium mb-8 text-center flex items-center justify-center gap-3 text-white drop-shadow-md w-full flex-wrap">
							<p className="truncate max-w-xs">{`Wallet Connected: ${address.slice(0, 6)}...${address.slice(-4)}`}</p>
							<p>Chain ID: {chainId}</p>
							<button
								onClick={handleDisconnectWallet}
								className="bg-gray-600/70 dark:bg-gray-700/70 text-white p-2 rounded-full hover:bg-gray-800/70 transition-colors duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 hover:scale-105"
								aria-label="Disconnect Wallet"
							>
								<FaPlug className="w-4 h-4" />
							</button>
						</div>
						<div
							className={`w-full p-6 sm:p-8 text-base font-medium rounded-lg shadow-md ${isDarkMode ? "bg-gray-900/95 text-gray-100 border-2 border-gray-700" : "bg-gray-50/95 text-gray-900"} backdrop-blur-md transition-all duration-300`}
						>
							<p className="text-center leading-relaxed">
								{isEthBalanceLoading ||
								isUsdcBalanceLoading ||
								isUsdtBalanceLoading
									? "Loading..."
									: `ETH: ${parseFloat(
											ethBalance?.formatted || "0",
										).toLocaleString("en-US", {
											minimumFractionDigits: 0,
											maximumFractionDigits: 6,
										})} | USDC: ${parseFloat(
											usdcBalance?.formatted || "0",
										).toLocaleString("en-US", {
											minimumFractionDigits: 0,
											maximumFractionDigits: 2,
										})} | USDT: ${parseFloat(
											usdtBalance?.formatted || "0",
										).toLocaleString("en-US", {
											minimumFractionDigits: 0,
											maximumFractionDigits: 2,
										})}`}
							</p>
						</div>
					</>
				)}

				<div
					className={`w-full max-w-xl p-6 sm:p-8 rounded-lg shadow-md ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 border-2 border-gray-600" : "bg-gray-50 text-gray-900"} backdrop-blur-md transition-all duration-300 animate-fade-in`}
				>
					<div className="w-full">
						<h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center leading-snug">
							Make a Donation
						</h2>
						<p className="text-sm sm:text-base text-center mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
							{isCustomMode
								? "Enter your donation command (e.g., Donate 0.001 ETH to a custom address or cause like education)."
								: "Enter the amount, select currency, and choose a cause."}
						</p>
						<button
							onClick={() => setIsCustomMode(!isCustomMode)}
							className="w-full mb-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 hover:scale-105"
							aria-label={
								isCustomMode ? "Switch to Simple Mode" : "Switch to Custom Mode"
							}
						>
							{isCustomMode ? "Switch to Simple Mode" : "Switch to Custom Mode"}
						</button>

						{isCustomMode ? (
							<div className="mb-4">
								<input
									type="text"
									value={customCommand}
									onChange={(e) => setCustomCommand(e.target.value)}
									placeholder="Donate 0.001 ETH to 0x... or education"
									className={`w-full p-3 sm:p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm sm:text-base transition-all duration-300 ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white/80 border-gray-200 text-gray-900"} ${isCommandValid ? "border-blue-500" : "border-red-300"}`}
									aria-label="Custom donation command"
									aria-describedby="custom-command-description"
								/>
								<p
									id="custom-command-description"
									className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1"
								>
									E.g., "Donate 0.001 ETH to 0x123..." or "Donate 10 USDC to
									education"
								</p>
							</div>
						) : (
							<div className="flex flex-col sm:flex-row gap-4 mb-4 justify-center">
								<div className="w-full sm:w-1/3 mb-2 sm:mb-0">
									<input
										type="number"
										step="0.0001"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										placeholder={amountPlaceholder}
										className={`w-full p-3 sm:p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm sm:text-base transition-all duration-300 ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white/80 border-gray-200 text-gray-900"} ${amount.match(/^\d+\.?\d*$/) && parseFloat(amount) > 0 ? "border-blue-500" : "border-red-300"}`}
										aria-label="Donation amount"
										aria-describedby="donation-amount-description"
									/>
									<p
										id="donation-amount-description"
										className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1"
									>
										Enter amount in {currency}
									</p>
								</div>
								<div className="w-full sm:w-1/3 mb-2 sm:mb-0">
									<select
										value={currency}
										onChange={(e) => setCurrency(e.target.value)}
										className={`w-full p-3 sm:p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm sm:text-base transition-all duration-300 ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white/80 border-gray-200 text-gray-900"}`}
										aria-label="Select currency"
									>
										<option value="ETH">ETH</option>
										<option value="USDC">USDC</option>
										<option value="USDT">USDT</option>
									</select>
								</div>
								<div className="w-full sm:w-1/3">
									<select
										value={cause}
										onChange={(e) => setCause(e.target.value)}
										className={`w-full p-3 sm:p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm sm:text-base transition-all duration-300 ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white/80 border-gray-200 text-gray-900"}`}
										aria-label="Select cause"
									>
										<option value="education">Education</option>
										<option value="health">Health</option>
										<option value="environment">Environment</option>
										<option value="social">Social Impact</option>
									</select>
								</div>
							</div>
						)}

						{(isEthBalanceLoading ||
							isUsdcBalanceLoading ||
							isUsdtBalanceLoading) && (
							<div className="text-center text-yellow-700 dark:text-yellow-300 text-sm mb-4 transition-all duration-300 animate-pulse">
								<p>Loading balance...</p>
							</div>
						)}

						<button
							onClick={handleSubmit}
							disabled={
								!address ||
								isLoading ||
								!isCommandValid ||
								isEthBalanceLoading ||
								isUsdcBalanceLoading ||
								isUsdtBalanceLoading
							}
							className={`w-full p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-300 shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2 ${!address || isLoading || !isCommandValid || isEthBalanceLoading || isUsdcBalanceLoading || isUsdtBalanceLoading ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600" : ""} hover:scale-105`}
							aria-label="Confirm Donation"
							aria-busy={isLoading}
						>
							{isLoading ? (
								<span className="flex items-center gap-2">
									<svg
										className="animate-spin h-5 w-5 text-white"
										role="status"
										aria-label="Processing"
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
									<span>Processing...</span>
								</span>
							) : (
								<>
									<span>Send Donation</span>
									{transactionStatus === "Confirmed" && (
										<FaCheckCircle className="text-white" />
									)}
								</>
							)}
						</button>
					</div>
				</div>

				{message && (
					<div
						role="alert"
						aria-live="polite"
						className="mt-6 w-full max-w-xl mx-auto transition-all duration-300"
					>
						{typeof message === "string" ? (
							<p
								className={`text-center text-sm font-medium ${message.includes("Error") || message.includes("Insufficient") ? "text-red-500" : "text-emerald-500"}`}
							>
								{message}
							</p>
						) : (
							<>
								{message}
								{transactionStatus === "Confirmed" && (
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
									</div>
								)}
							</>
						)}
					</div>
				)}

				{isDevDonationModalOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-all duration-300"
						role="dialog"
						aria-labelledby="dev-donation-modal-title"
						aria-modal="true"
					>
						<div
							className={`w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-200"} border animate-slide-in`}
						>
							<div className="flex justify-between items-center mb-4">
								<h3
									id="dev-donation-modal-title"
									className="text-xl font-semibold"
								>
									Donate to Developer
								</h3>
								<button
									onClick={handleCloseDevModal}
									className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
									aria-label="Close developer donation modal"
								>
									<FaTimes className="w-6 h-6" />
								</button>
							</div>
							<p className="mb-4 text-gray-600 dark:text-gray-400">
								Support the developer and help keep this project running! Enter
								your donation amount in ETH below. Thank you!
							</p>
							<div className="mb-4">
								<input
									type="number"
									step="0.0001"
									value={devDonationAmount}
									onChange={(e) => setDevDonationAmount(e.target.value)}
									placeholder="Enter ETH amount (e.g., 0.005)"
									className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white/80 border-gray-200 text-gray-900"}`}
									aria-label="Developer donation amount"
								/>
							</div>
							<div className="flex gap-4">
								<button
									onClick={() => {
										if (
											devDonationAmount &&
											parseFloat(devDonationAmount) > 0
										) {
											handleDevDonation(devDonationAmount);
										} else {
											setMessage(
												<div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-slide-in">
													<FaExclamationCircle />{" "}
													<p>Invalid donation amount.</p>
												</div>,
											);
										}
									}}
									className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
									aria-label="Confirm developer donation"
									disabled={
										!devDonationAmount || parseFloat(devDonationAmount) <= 0
									}
								>
									Yes
								</button>
								<button
									onClick={handleCloseDevModal}
									className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
									aria-label="Skip developer donation"
								>
									No
								</button>
							</div>
						</div>
					</div>
				)}

				{isHistoryModalOpen && (
					<div
						className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-all duration-300 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
					>
						<div
							className={`w-full max-w-lg sm:max-w-2xl mx-auto p-6 sm:p-8 rounded-lg shadow-md ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gray-50"} transition-all duration-300 transform ${isHistoryModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
						>
							<h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-center leading-snug">
								Transaction History
							</h3>
							<ul className="list-none pl-0 space-y-3 max-h-80 overflow-y-auto">
								{history.map((entry, i) => (
									<li
										key={i}
										className={`text-sm sm:text-base flex items-center justify-between p-2 rounded-lg ${i === history.length - 1 ? "bg-emerald-100 dark:bg-emerald-900/30" : ""}`}
									>
										<a
											href={`https://sepolia.basescan.org/tx/${entry.tx_hash}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 text-blue-500 dark:text-blue-400 hover:underline"
										>
											<FaCheckCircle className="text-emerald-500 dark:text-emerald-400" />
											<span className="text-gray-700 dark:text-gray-300">
												{`${entry.created_at} - From: ${entry.user_address.slice(0, 6)}...${entry.user_address.slice(-4)} - Donation of ${entry.amount} ${entry.currency} to ${entry.to_address.slice(0, 6)}... (Dev: ${entry.dev_donation} ${entry.currency})`}
											</span>
										</a>
									</li>
								))}
							</ul>
							{isClearConfirmOpen ? (
								<div className="mt-6 space-y-4">
									<p className="text-center text-sm text-yellow-700 dark:text-yellow-300">
										Are you sure you want to clear the history?
									</p>
									<div className="flex gap-4 justify-center">
										<button
											onClick={handleClearHistory}
											className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500"
											aria-label="Confirm Clear History"
										>
											Yes
										</button>
										<button
											onClick={handleCancelClear}
											className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
											aria-label="Cancel Clear History"
										>
											No
										</button>
									</div>
								</div>
							) : (
								<button
									onClick={handleClearHistory}
									className="mt-6 w-full px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500"
									aria-label="Clear History"
								>
									Clear History
								</button>
							)}
							<button
								onClick={() => {
									setIsHistoryModalOpen(false);
									setIsClearConfirmOpen(false);
								}}
								className="mt-4 w-full px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
								aria-label="Close History Modal"
							>
								Close
							</button>
						</div>
					</div>
				)}

				{isStatsModalOpen && (
					<div
						className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-all duration-300 ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
					>
						<div
							className={`w-full max-w-lg sm:max-w-2xl mx-auto p-6 sm:p-8 rounded-lg shadow-md ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-gray-50"} transition-all duration-300 transform ${isStatsModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
						>
							<h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-center leading-snug">
								Donation Statistics
							</h3>

							{/* Filtros */}
							<div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
								<select
									onChange={(e) => setFilterCause(e.target.value)}
									value={filterCause}
									className={`w-full sm:w-1/3 p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white/80 border-gray-200 text-gray-900"}`}
									aria-label="Filter by cause"
								>
									<option value="">All Causes</option>
									<option value="education">Education</option>
									<option value="health">Health</option>
									<option value="environment">Environment</option>
									<option value="social">Social Impact</option>
								</select>
								<select
									onChange={(e) => setFilterCurrency(e.target.value)}
									value={filterCurrency}
									className={`w-full sm:w-1/3 p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white/80 border-gray-200 text-gray-900"}`}
									aria-label="Filter by currency"
								>
									<option value="">All Currencies</option>
									<option value="ETH">ETH</option>
									<option value="USDC">USDC</option>
									<option value="USDT">USDT</option>
								</select>
							</div>

							{/* Gráfico */}
							<div className="mb-6">
								<Bar
									data={{
										labels: filteredStats.map((s) => s.cause),
										datasets: [
											{
												label: "ETH",
												data: filteredStats.map((s) => s.ETH),
												backgroundColor: "rgba(59, 130, 246, 0.6)",
											},
											{
												label: "USDC",
												data: filteredStats.map((s) => s.USDC),
												backgroundColor: "rgba(16, 185, 129, 0.6)",
											},
											{
												label: "USDT",
												data: filteredStats.map((s) => s.USDT),
												backgroundColor: "rgba(245, 158, 11, 0.6)",
											},
										],
									}}
									options={{
										responsive: true,
										plugins: {
											legend: {
												position: "top",
												labels: { color: isDarkMode ? "#fff" : "#000" },
											},
											title: {
												display: true,
												text: "Total Donations by Cause",
												color: isDarkMode ? "#fff" : "#000",
											},
										},
										scales: {
											x: { ticks: { color: isDarkMode ? "#fff" : "#000" } },
											y: {
												beginAtZero: true,
												ticks: { color: isDarkMode ? "#fff" : "#000" },
												title: {
													display: true,
													text: "Amount",
													color: isDarkMode ? "#fff" : "#000",
												},
											},
										},
									}}
								/>
							</div>

							{/* Estatísticas Filtradas */}
							<div className="text-center mt-4 space-y-2">
								{filteredStats.map((stat) => (
									<p key={stat.cause}>
										{stat.cause}: {stat.ETH.toFixed(4)} ETH |{" "}
										{stat.USDC.toFixed(2)} USDC | {stat.USDT.toFixed(2)} USDT
									</p>
								))}
							</div>

							{/* Botão de Exportação */}
							<button
								onClick={exportToCSV}
								className="mt-6 w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
								aria-label="Export Statistics to CSV"
							>
								Export to CSV
							</button>

							<button
								onClick={() => setIsStatsModalOpen(false)}
								className="mt-4 w-full px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500"
								aria-label="Close Statistics Modal"
							>
								Close
							</button>
						</div>
					</div>
				)}

				<DonationModal
					isOpen={isModalOpen}
					onConfirm={(value) => {
						setIsModalOpen(false);
						if (resolveModal) {
							resolveModal(value);
							setResolveModal(null);
						}
					}}
					isDarkMode={isDarkMode}
				/>
			</div>
		</div>
	);
}
