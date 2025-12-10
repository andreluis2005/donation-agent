// app/components/DonationForm.tsx
"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaRobot } from "react-icons/fa";

interface DonationFormProps {
	amount: string;
	setAmount: (value: string) => void;
	currency: string;
	setCurrency: (value: string) => void;
	cause: string;
	setCause: (value: string) => void;
	isCustomMode: boolean;
	setIsCustomMode: (value: boolean) => void;
	customCommand: string;
	setCustomCommand: (value: string) => void;
	isCommandValid: boolean;
	setIsCommandValid: (value: boolean) => void;
	handleSubmit: () => Promise<void>;
	isLoading: boolean;
	isEthBalanceLoading: boolean;
	isDarkMode: boolean;
}

export default function DonationForm({
	amount,
	setAmount,
	currency,
	setCurrency,
	cause,
	setCause,
	isCustomMode,
	setIsCustomMode,
	customCommand,
	setCustomCommand,
	isCommandValid,
	setIsCommandValid,
	handleSubmit,
	isLoading,
	isEthBalanceLoading,
	isDarkMode,
}: DonationFormProps) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true); // Marca como cliente após a hidratação
	}, []);

	useEffect(() => {
		if (isCustomMode) {
			const isValid = customCommand.match(
				/Donate\s+(\d+\.?\d*)\s+ETH\s+to\s+(0x[a-fA-F0-9]{40}|education|health|environment|social)/i,
			);
			setIsCommandValid(!!isValid);
		} else {
			const isValid =
				!!amount.match(/^\d+\.?\d*$/) && parseFloat(amount) > 0 && !!cause;
			setIsCommandValid(isValid);
		}
	}, [amount, currency, cause, customCommand, isCustomMode, setIsCommandValid]);

	const amountPlaceholder = "0.001";

	return (
		<div
			className={`w-full max-w-xl p-6 sm:p-8 rounded-lg shadow-md ${
				isDarkMode
					? "bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 border-2 border-gray-600"
					: "bg-gray-50 text-gray-900"
			} backdrop-blur-md transition-all duration-300 animate-fade-in`}
		>
			<h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center leading-snug">
				Make a Donation
			</h2>
			<p className="text-sm sm:text-base text-center mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">
				{isCustomMode
					? "Enter your donation command (e.g., Donate 0.001 ETH to a custom address or cause like education)."
					: "Enter the amount and choose a cause."}
			</p>
			<button
				onClick={() => setIsCustomMode(!isCustomMode)}
				className="w-full mb-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 hover:scale-105"
				aria-label={
					isCustomMode ? "Switch to Simple Mode" : "Switch to Custom Mode"
				}
			>
				<span className="flex items-center justify-center gap-2">
					<FaRobot className="text-lg" />
					{isCustomMode ? "Switch to Simple Mode" : "Switch to Custom Mode"}
				</span>
			</button>

			{isCustomMode ? (
				<div className="mb-4">
					<input
						type="text"
						value={customCommand}
						onChange={(e) => setCustomCommand(e.target.value)}
						placeholder="Donate 0.001 ETH to 0x... or education"
						className={`w-full p-3 sm:p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm sm:text-base transition-all duration-300 ${
							isDarkMode
								? "bg-gray-900/80 border-gray-600 text-gray-100 dark:focus:ring-offset-gray-900"
								: "bg-white/80 border-gray-200 text-gray-900 dark:focus:ring-offset-gray-200"
						} ${isCommandValid ? "border-blue-500" : "border-red-300"}`}
						aria-label="Custom donation command"
						aria-describedby="custom-command-description"
					/>
					<p
						id="custom-command-description"
						className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1"
					>
						E.g., &quot;Donate 0.001 ETH to 0x123...&quot; or &quot;Donate 0.001
						ETH to education&quot;
					</p>
				</div>
			) : (
				<div className="flex flex-col sm:flex-row gap-4 mb-4 justify-center">
					<div className="w-full sm:w-1/2 mb-2 sm:mb-0">
						<input
							type="number"
							step="0.0001"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder={amountPlaceholder}
							className={`w-full p-3 sm:p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm sm:text-base transition-all duration-300 ${
								isDarkMode
									? "bg-gray-900/80 border-gray-600 text-gray-100 dark:focus:ring-offset-gray-900"
									: "bg-white/80 border-gray-200 text-gray-900 dark:focus:ring-offset-gray-200"
							} ${
								amount.match(/^\d+\.?\d*$/) && parseFloat(amount) > 0
									? "border-blue-500"
									: "border-red-300"
							}`}
							aria-label="Donation amount"
							aria-describedby="donation-amount-description"
						/>
						<p
							id="donation-amount-description"
							className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1"
						>
							Enter amount (ETH)
						</p>
					</div>
					<div className="w-full sm:w-1/2">
						<select
							value={cause}
							onChange={(e) => setCause(e.target.value as string)}
							className={`w-full p-3 sm:p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-sm sm:text-base transition-all duration-300 ${
								isDarkMode
									? "bg-gray-900/80 border-gray-600 text-gray-100 dark:focus:ring-offset-gray-900"
									: "bg-white/80 border-gray-200 text-gray-900 dark:focus:ring-offset-gray-200"
							}`}
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

			{isClient && isEthBalanceLoading && (
				<div className="text-center text-blue-500 dark:text-blue-400 text-sm mb-4 transition-all duration-300 animate-pulse">
					<p>Loading balance...</p>
				</div>
			)}

			<button
				onClick={handleSubmit}
				disabled={
					!isCommandValid || isLoading || (isClient && isEthBalanceLoading)
				}
				className={`w-full p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-300 shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2 ${
					!isCommandValid || isLoading || (isClient && isEthBalanceLoading)
						? "bg-gray-600 cursor-not-allowed"
						: "hover:scale-105"
				}`}
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
						{isCommandValid && <FaCheckCircle className="text-white" />}
					</>
				)}
			</button>
		</div>
	);
}
// fim do app
