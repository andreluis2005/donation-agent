"use client";

import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function MessageDisplay({
	message,
}: {
	message: string | null;
}) {
	if (!message) return null;

	const isError =
		message.includes("Error") ||
		message.includes("Insufficient") ||
		message.includes("Invalid");
	const Icon = isError ? FaExclamationCircle : FaCheckCircle;
	const bgColor = isError
		? "bg-red-100 dark:bg-red-900/50"
		: "bg-emerald-100 dark:bg-emerald-900/50";
	const textColor = isError
		? "text-red-700 dark:text-red-300"
		: "text-emerald-700 dark:text-emerald-300";

	return (
		<div
			role="alert"
			aria-live="polite"
			className={`mt-6 w-full max-w-xl mx-auto p-3 rounded-lg ${bgColor} ${textColor} flex items-center gap-2 animate-slide-in transition-all duration-300`}
		>
			<Icon />
			{message.includes("Hash:") ? (
				<div>
					<p>{message.split("Hash:")[0].trim()}</p>
					<a
						href={`https://sepolia.basescan.org/tx/${message.split("Hash:")[1].trim()}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm underline"
					>
						Hash: {message.split("Hash:")[1].trim().slice(0, 10)}...
					</a>
				</div>
			) : (
				<p>{message}</p>
			)}
		</div>
	);
}
