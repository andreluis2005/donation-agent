// app/hooks/useDonationLogic.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useWriteContract, useBalance, useAccount, useChainId } from "wagmi";
import { parseEther, isAddress } from "viem";
import { erc20ABI } from "../../lib/erc20ABI";
import { useTransactionHistory } from "./useTransactionHistory";
import { tokenAddresses, currenciesByChain } from "@/lib/chains";

const causeAddressMap = {
	education: "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6",
	health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
	environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
	social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
	developer: "0xf2D3CeF68400248C9876f5A281291c7c4603D100",
} as const;

// Contrato só existe na Base Sepolia
const CONTRACT_ADDRESS_BASE_SEPOLIA =
	"0x587811df3f080aadc6d26b10d99b4bc73aa30cd5";
const CONTRACT_ABI = [
	{
		inputs: [],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "donor",
				type: "address",
			},
			{ indexed: false, internalType: "string", name: "cause", type: "string" },
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "DonationReceived",
		type: "event",
	},
	{
		inputs: [{ internalType: "string", name: "", type: "string" }],
		name: "causeAddresses",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "string", name: "cause", type: "string" }],
		name: "donate",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "recipient", type: "address" }],
		name: "donateToCustomAddress",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [{ internalType: "address", name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "string", name: "cause", type: "string" },
			{ internalType: "address", name: "newAddress", type: "address" },
		],
		name: "updateCauseAddress",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];

interface DonationData {
	value: string;
	toAddress: string;
	currency: string;
}

export function useDonationLogic() {
	const { setFrameReady, isReady } = useMiniKit();
	const { address } = useAccount();
	const chainId = useChainId();
	const { writeContractAsync } = useWriteContract();
	const { refetchHistory } = useTransactionHistory(address);

	// Moedas disponíveis nessa rede
	const availableCurrencies = currenciesByChain[chainId] || [
		"ETH",
		"USDC",
		"USDT",
	];

	// Tokens da rede atual
	const tokens = tokenAddresses[chainId] || tokenAddresses[84532];

	// Saldos
	const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
		address,
	});
	const { data: usdcBalance, isLoading: isUsdcLoading } = useBalance({
		address,
		token: tokens.USDC,
	});
	const { data: usdtBalance, isLoading: isUsdtLoading } = useBalance({
		address,
		token: tokens.USDT,
	});
	const { data: cusdBalance, isLoading: isCusdLoading } = useBalance({
		address,
		token: tokens.cUSD,
	});

	const [amount, setAmount] = useState("");
	const [currency, setCurrency] = useState(availableCurrencies[0]); // primeira moeda da rede
	const [cause, setCause] = useState("education");
	const [customCommand, setCustomCommand] = useState("");
	const [isCustomMode, setIsCustomMode] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [transactionStatus, setTransactionStatus] = useState("");
	const [isCommandValid, setIsCommandValid] = useState(false);
	const [lastDonation, setLastDonation] = useState<any>(null);
	const [isDevDonationModalOpen, setIsDevDonationModalOpen] = useState(false);
	const [devDonationAmount, setDevDonationAmount] = useState("");

	useEffect(() => {
		if (!isReady) setFrameReady();
	}, [isReady, setFrameReady]);

	const validateInput = useCallback(() => {
		if (!address) return "Conecte uma carteira";
		if (!isCustomMode && (!amount || parseFloat(amount) <= 0))
			return "Valor inválido";
		if (isCustomMode && !isCommandValid) return "Comando inválido";
		if (
			!isCustomMode &&
			!causeAddressMap[cause as keyof typeof causeAddressMap]
		)
			return "Causa inválida";
		return null;
	}, [address, amount, cause, isCustomMode, isCommandValid]);

	const handleSubmit = useCallback(async () => {
		const error = validateInput();
		if (error) {
			setMessage(error);
			return;
		}

		if (isNativeLoading || isUsdcLoading || isUsdtLoading || isCusdLoading) {
			setMessage("Carregando saldo...");
			return;
		}

		setMessage(null);
		setIsLoading(true);
		setTransactionStatus("Pending");

		let data: DonationData | null = null;

		try {
			if (!isCustomMode) {
				data = {
					value: amount,
					toAddress: causeAddressMap[cause as keyof typeof causeAddressMap],
					currency: currency,
				};
			} else {
				const res = await fetch("/api/agent", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ command: customCommand, donateToDev: false }),
				});
				if (!res.ok) throw new Error("Erro no agente");
				data = await res.json();
			}

			if (!data?.value || !data?.toAddress || !data?.currency) {
				throw new Error("Dados inválidos");
			}

			const validatedToAddress = isAddress(data.toAddress)
				? (data.toAddress as `0x${string}`)
				: causeAddressMap[
						Object.keys(causeAddressMap).find(
							(k) =>
								causeAddressMap[
									k as keyof typeof causeAddressMap
								].toLowerCase() === data.toAddress.toLowerCase(),
						) as keyof typeof causeAddressMap
					] || (data.toAddress as `0x${string}`);

			let txHash: string;

			// === CELO NATIVO ===
			if (data.currency === "CELO") {
				const value = parseEther(data.value);
				if (
					parseFloat(nativeBalance?.formatted || "0") < parseFloat(data.value)
				) {
					throw new Error("Saldo CELO insuficiente");
				}
				txHash = await writeContractAsync({
					to: validatedToAddress,
					value,
				});
			}
			// === ETH (Base) ===
			else if (data.currency === "ETH") {
				const value = parseEther(data.value);
				if (
					parseFloat(nativeBalance?.formatted || "0") < parseFloat(data.value)
				) {
					throw new Error("Saldo ETH insuficiente");
				}

				if (chainId === 84532) {
					txHash = await writeContractAsync({
						address: CONTRACT_ADDRESS_BASE_SEPOLIA as `0x${string}`,
						abi: CONTRACT_ABI,
						functionName: isCustomMode ? "donateToCustomAddress" : "donate",
						args: isCustomMode ? [validatedToAddress] : [cause],
						value,
					});
				} else {
					txHash = await writeContractAsync({
						to: validatedToAddress,
						value,
					});
				}
			}
			// === USDC / USDT / cUSD (ERC20) ===
			else {
				const tokenMap: Record<string, any> = {
					USDC: { address: tokens.USDC, balance: usdcBalance },
					USDT: { address: tokens.USDT, balance: usdtBalance },
					cUSD: { address: tokens.cUSD, balance: cusdBalance },
				};

				const tokenInfo = tokenMap[data.currency];
				if (!tokenInfo?.address)
					throw new Error("Token não suportado nesta rede");

				if (
					parseFloat(tokenInfo.balance?.formatted || "0") <
					parseFloat(data.value)
				) {
					throw new Error(`Saldo ${data.currency} insuficiente`);
				}

				const amountInUnits = BigInt(
					Math.floor(parseFloat(data.value) * 1_000_000),
				);

				txHash = await writeContractAsync({
					address: tokenInfo.address,
					abi: erc20ABI,
					functionName: "transfer",
					args: [validatedToAddress, amountInUnits],
				});
			}

			// Salva no banco
			await fetch("/api/donate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					command: `Donate ${data.value} ${data.currency} to ${isCustomMode ? data.toAddress : cause}`,
					signerData: { address },
					donateToDev: false,
					txHash,
					toAddress: validatedToAddress,
					chainId,
				}),
			});

			await refetchHistory();
			setLastDonation({
				...data,
				toAddress: validatedToAddress,
				cause: isCustomMode ? "Custom" : cause,
				txHash,
				chainId,
			});

			if (data.currency === "ETH" || data.currency === "CELO") {
				setIsDevDonationModalOpen(true);
			}

			setMessage(`Doação enviada! Tx: ${txHash.slice(0, 10)}...`);
			setTransactionStatus("Confirmed");
			setAmount("");
			setCustomCommand("");
		} catch (err: any) {
			setMessage(`Erro: ${err.message || "Falhou"}`);
			setTransactionStatus("Failed");
		} finally {
			setIsLoading(false);
		}
	}, [
		address,
		amount,
		cause,
		currency,
		customCommand,
		isCustomMode,
		isCommandValid,
		chainId,
		nativeBalance,
		usdcBalance,
		usdtBalance,
		cusdBalance,
		writeContractAsync,
		refetchHistory,
	]);

	return {
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
		isEthBalanceLoading: isNativeLoading,
		isUsdcBalanceLoading: isUsdcLoading,
		isUsdtBalanceLoading: isUsdtLoading,
		isCusdBalanceLoading: isCusdLoading,
		isDevDonationModalOpen,
		setIsDevDonationModalOpen,
		devDonationAmount,
		setDevDonationAmount,
		handleDevDonation: () => {}, // você pode manter o original se quiser
		chainId,
		availableCurrencies, // ← NOVO: use isso no seu DonationForm
	};
}
