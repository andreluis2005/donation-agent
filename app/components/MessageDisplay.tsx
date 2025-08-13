// app/components/MessageDisplay.tsx
"use client";

import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function MessageDisplay({
	message,
	isDarkMode,
}: {
	message: string | null;
	isDarkMode: boolean;
}) {
	if (!message) return null;

	const isError =
		message.includes("Error") ||
		message.includes("Insufficient") ||
		message.includes("Invalid");
	const Icon = isError ? FaExclamationCircle : FaCheckCircle;
	const bgColor = isError
		? isDarkMode
			? "bg-red-900/50"
			: "bg-red-100"
		: isDarkMode
			? "bg-emerald-900/50"
			: "bg-emerald-100";
	const textColor = isError
		? isDarkMode
			? "text-red-300"
			: "text-red-700"
		: isDarkMode
			? "text-emerald-300"
			: "text-emerald-700";

	const displayMessage =
		message.includes("USDC") || message.includes("USDT")
			? message.includes("Insufficient")
				? "Insufficient balance"
				: message.includes("Hash:")
					? "Donation sent successfully!"
					: "Transaction Error"
			: message;

	return (
		<div
			role="alert"
			aria-live="polite"
			className={`mt-6 w-full max-w-xl mx-auto p-3 rounded-lg ${bgColor} ${textColor} flex items-center gap-2 animate-slide-in transition-all duration-300`}
		>
			<Icon />
			{displayMessage.includes("Hash:") ? (
				<div>
					<p>{displayMessage.split("Hash:")[0].trim()}</p>
					<a
						href={`https://basescan.org/tx/${message.split("Hash:")[1]?.trim()}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm underline"
					>
						Hash: {message.split("Hash:")[1]?.trim().slice(0, 10)}...
					</a>
				</div>
			) : (
				<p>{displayMessage}</p>
			)}
		</div>
	);
}
