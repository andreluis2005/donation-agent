"use client";

import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";

export default function TransactionHistory({
	history,
	setHistory,
	isHistoryModalOpen,
	setIsHistoryModalOpen,
}: {
	history: {
		user_address: string;
		amount: string;
		currency: string;
		to_address: string;
		cause: string;
		dev_donation: number;
		tx_hash: string;
		created_at: string;
	}[];
	setHistory: (
		value: {
			user_address: string;
			amount: string;
			currency: string;
			to_address: string;
			cause: string;
			dev_donation: number;
			tx_hash: string;
			created_at: string;
		}[],
	) => void;
	isHistoryModalOpen: boolean;
	setIsHistoryModalOpen: (value: boolean) => void;
}) {
	const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

	const handleClearHistory = () => {
		if (isClearConfirmOpen) {
			setHistory([]);
			setIsClearConfirmOpen(false);
		} else {
			setIsClearConfirmOpen(true);
		}
	};

	const handleCancelClear = () => {
		setIsClearConfirmOpen(false);
	};

	useEffect(() => {
		// Busca inicial do histórico do Supabase (simulação)
		const fetchHistory = async () => {
			try {
				const response = await fetch("/api/history");
				if (response.ok) {
					const data = await response.json();
					setHistory(data);
				}
			} catch (error) {
				console.error("Failed to fetch history:", error);
			}
		};
		fetchHistory();
	}, [setHistory]);

	return (
		isHistoryModalOpen && (
			<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-all duration-300 text-gray-100">
				<div className="w-full max-w-lg sm:max-w-2xl mx-auto p-6 sm:p-8 rounded-lg shadow-md bg-gradient-to-br from-gray-900 to-gray-800 transition-all duration-300 transform scale-100 opacity-100">
					<h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-center leading-snug">
						Transaction History
					</h3>
					<ul className="list-none pl-0 space-y-3 max-h-80 overflow-y-auto">
						{history.map((entry, i) => (
							<li
								key={i}
								className={`text-sm sm:text-base flex items-center justify-between p-2 rounded-lg ${
									i === history.length - 1 ? "bg-emerald-900/30" : ""
								}`}
							>
								<a
									href={`https://sepolia.basescan.org/tx/${entry.tx_hash}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-blue-400 hover:underline"
								>
									<FaCheckCircle className="text-emerald-400" />
									<span className="text-gray-300">
										{`${entry.created_at} - From: ${entry.user_address.slice(0, 6)}...${entry.user_address.slice(-4)} - Donation of ${entry.amount} ${entry.currency} to ${entry.to_address.slice(0, 6)}... (Dev: ${entry.dev_donation} ${entry.currency})`}
									</span>
								</a>
							</li>
						))}
					</ul>
					{isClearConfirmOpen ? (
						<div className="mt-6 space-y-4">
							<p className="text-center text-sm text-yellow-300">
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
		)
	);
}
