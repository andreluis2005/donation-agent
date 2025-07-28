"use client";

import { useState, useCallback, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import {
	useSendTransaction,
	useWriteContract,
	useBalance,
	useAccount,
} from "wagmi";
import { parseEther, isAddress } from "viem";
import { erc20ABI } from "../../lib/erc20ABI";
import { useTransactionHistory } from "./useTransactionHistory";

const causeAddressMap = {
	education: "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6",
	health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
	environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
	social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
	developer: "0xf2D3CeF68400248C9876f5A281291c7c4603D100",
};

export function useDonationLogic() {
	const { setFrameReady, isFrameReady } = useMiniKit();
	const { address } = useAccount();
	const { sendTransactionAsync } = useSendTransaction();
	const { writeContractAsync } = useWriteContract();
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

	const [amount, setAmount] = useState("");
	const [currency, setCurrency] = useState("ETH");
	const [cause, setCause] = useState("education");
	const [customCommand, setCustomCommand] = useState("");
	const [isCustomMode, setIsCustomMode] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [transactionStatus, setTransactionStatus] = useState("");
	const [isCommandValid, setIsCommandValid] = useState<boolean>(false);
	const [lastDonation, setLastDonation] = useState<{
		value: string;
		currency: string;
		toAddress: `0x${string}`;
		cause: string;
	} | null>(null);
	const [isDevDonationModalOpen, setIsDevDonationModalOpen] = useState(false);
	const [devDonationAmount, setDevDonationAmount] = useState("");

	const { setHistory } = useTransactionHistory(address);

	useEffect(() => {
		if (!isFrameReady) {
			setFrameReady();
			console.log("Minikit frame set as ready");
		}
	}, [isFrameReady, setFrameReady]);

	const validateInput = useCallback(() => {
		if (!address) return "Connect a wallet.";
		if (!isCustomMode && (!amount || parseFloat(amount) <= 0))
			return "Invalid amount.";
		if (isCustomMode && !isCommandValid) return "Invalid command.";
		if (
			!isCustomMode &&
			!causeAddressMap[cause as keyof typeof causeAddressMap]
		)
			return "Invalid cause.";
		return null;
	}, [address, amount, cause, isCustomMode, isCommandValid]);

	const handleSubmit = useCallback(async () => {
		const error = validateInput();
		if (error) {
			setMessage(error);
			return;
		}

		if (isEthBalanceLoading || isUsdcBalanceLoading || isUsdtBalanceLoading) {
			setMessage("Loading balance, please wait...");
			return;
		}

		setMessage(null);
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
					toAddress: causeAddressMap[cause as keyof typeof causeAddressMap],
					currency: currency.toUpperCase(),
				};
				if (data.currency === "ETH") {
					data.amountInWei = parseEther(data.value).toString();
				}
			} else {
				const response = await fetch("/api/agent", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ command: customCommand, donateToDev: false }),
				});

				if (response.status !== 200) {
					throw new Error(`Request failed with status ${response.status}`);
				}

				data = await response.json();

				if (data === null || "error" in data) {
					throw new Error(
						data?.error ? String(data.error) : "Invalid API response data",
					);
				}
			}

			if (
				data &&
				"value" in data &&
				"toAddress" in data &&
				"currency" in data
			) {
				const validatedToAddress = isAddress(data.toAddress)
					? (data.toAddress as `0x${string}`)
					: (causeAddressMap[
							cause as keyof typeof causeAddressMap
						] as `0x${string}`);
				if (!isAddress(validatedToAddress)) {
					throw new Error("Invalid Ethereum address");
				}

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
						)} ${data.currency}, Required: ${amountToCheck.toFixed(2)} ${
							data.currency
						}`,
					);
				}

				let txHash: string;
				if (data.currency === "ETH") {
					const tx = await sendTransactionAsync({
						to: validatedToAddress,
						value: BigInt(
							data.amountInWei || parseEther(data.value).toString(),
						),
					});
					txHash = tx;
				} else if (data.currency === "USDC") {
					const amountInUnits = parseInt(
						(parseFloat(data.value) * 1e6).toString(),
					);
					const tx = await writeContractAsync({
						address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
						abi: erc20ABI,
						functionName: "transfer",
						args: [validatedToAddress, BigInt(amountInUnits)],
					});
					txHash = tx;
				} else if (data.currency === "USDT") {
					const amountInUnits = parseInt(
						(parseFloat(data.value) * 1e6).toString(),
					);
					const tx = await writeContractAsync({
						address: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2" as const,
						abi: erc20ABI,
						functionName: "transfer",
						args: [validatedToAddress, BigInt(amountInUnits)],
					});
					txHash = tx;
				} else {
					throw new Error(`Unsupported currency: ${data.currency}`);
				}

				// Envia no formato esperado pela API
				const command = `donate ${data.value} ${data.currency} to ${
					isCustomMode ? data.toAddress : cause
				}`;
				const response = await fetch("/api/donate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						command,
						signerData: { address },
						donateToDev: false,
						txHash,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					throw new Error(
						`Failed to save donation: ${errorData.error || response.statusText}`,
					);
				}

				const donationData = {
					user_address: address || "",
					amount: data.value,
					currency: data.currency,
					to_address: validatedToAddress,
					cause: isCustomMode ? "Custom Cause" : cause,
					dev_donation: 0,
					tx_hash: txHash,
					created_at: new Date().toISOString(),
				};

				setHistory([donationData]);
				setLastDonation({
					...data,
					toAddress: validatedToAddress,
					cause: isCustomMode ? "Custom Cause" : cause,
				});

				if (data.currency === "ETH") {
					setIsDevDonationModalOpen(true);
				}

				setMessage(`Donation sent successfully! Hash: ${txHash}`);
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
			setMessage(`Transaction Error: ${errorMessage}`);
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
		ethBalance?.formatted,
		isEthBalanceLoading,
		isUsdcBalanceLoading,
		isUsdtBalanceLoading,
		isCustomMode,
		sendTransactionAsync,
		usdcBalance?.formatted,
		usdtBalance?.formatted,
		validateInput,
		writeContractAsync,
		setHistory,
	]);

	const handleDevDonation = useCallback(
		async (amount: string) => {
			if (!address || !ethBalance || !amount) return;

			const devAddress = causeAddressMap["developer"] as `0x${string}`;
			const devAmountInWei = parseEther(amount);

			if (parseFloat(ethBalance.formatted || "0") < parseFloat(amount)) {
				setMessage("Insufficient ETH balance for developer donation.");
				setIsDevDonationModalOpen(false);
				return;
			}

			try {
				setIsLoading(true);
				const txHash = await sendTransactionAsync({
					to: devAddress,
					value: devAmountInWei,
				});

				const donationData = {
					user_address: address,
					amount,
					currency: "ETH",
					to_address: devAddress,
					cause: "Developer Donation",
					dev_donation: parseFloat(amount),
					tx_hash: txHash,
					created_at: new Date().toISOString(),
				};

				await fetch("/api/donate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						command: `donate ${amount} ETH to developer`,
						signerData: { address },
						donateToDev: true,
						txHash,
					}),
				});

				setHistory([donationData]);
				setMessage(`Developer donation sent successfully! Hash: ${txHash}`);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				setMessage(`Developer Donation Error: ${errorMessage}`);
			} finally {
				setIsDevDonationModalOpen(false);
				setDevDonationAmount("");
				setIsLoading(false);
			}
		},
		[address, ethBalance, sendTransactionAsync, setHistory, setMessage],
	);

	const handleCloseDevModal = useCallback(() => {
		setIsDevDonationModalOpen(false);
		setDevDonationAmount("");
	}, []);

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
		isEthBalanceLoading,
		isUsdcBalanceLoading,
		isUsdtBalanceLoading,
		isDevDonationModalOpen,
		setIsDevDonationModalOpen,
		devDonationAmount,
		setDevDonationAmount,
		handleDevDonation,
		handleCloseDevModal,
	};
}
