// app/components/TransactionHistory.tsx
"use client";

import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useTransactionHistory } from "../hooks/useTransactionHistory";

export default function TransactionHistory({
	isHistoryModalOpen,
	setIsHistoryModalOpen,
	isDarkMode,
	address,
}: {
	isHistoryModalOpen: boolean;
	setIsHistoryModalOpen: (value: boolean) => void;
	isDarkMode: boolean;
	address?: `0x${string}`;
}) {
	const [history, setHistory] = useState<
		{
			user_address: string;
			amount: string;
			currency: string;
			to_address: string;
			cause: string;
			dev_donation: number;
			tx_hash: string;
			created_at: string;
		}[]
	>([]);
	const { fetchDonations, isLoading, error } = useTransactionHistory(address);

	useEffect(() => {
		if (isHistoryModalOpen && address) {
			const loadHistory = async () => {
				const data = await fetchDonations();
				setHistory(data);
			};
			loadHistory();
		} else {
			setHistory([]);
		}
	}, [isHistoryModalOpen, address, fetchDonations]);

	const filteredHistory = history.filter((entry) => entry.currency === "ETH");

	return (
		isHistoryModalOpen && (
			<div
				className={`fixed inset-0 ${isDarkMode ? "bg-black bg-opacity-70" : "bg-gray-900 bg-opacity-50"} flex items-center justify-center transition-all duration-300`}
			>
				<div
					className={`w-full max-w-lg sm:max-w-2xl mx-auto p-6 sm:p-8 rounded-lg shadow-md ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
				>
					<h3
						className={`text-2xl font-semibold mb-4 text-center ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}
					>
						Transaction History
					</h3>
					{isLoading ? (
						<p
							className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
						>
							Loading transactions...
						</p>
					) : error ? (
						<p
							className={`text-center ${isDarkMode ? "text-red-300" : "text-red-600"}`}
						>
							{error}
						</p>
					) : filteredHistory.length === 0 ? (
						<p
							className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
						>
							No ETH transactions found.
						</p>
					) : (
						<ul className="space-y-4 max-h-96 overflow-y-auto">
							{filteredHistory.map((entry, index) => (
								<li
									key={index}
									className={`p-4 rounded-lg border ${isDarkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-100 border-gray-200"} flex justify-between items-center`}
								>
									<div
										className={isDarkMode ? "text-gray-100" : "text-gray-900"}
									>
										<p>
											<span className="font-semibold">Cause:</span>{" "}
											{entry.cause}
										</p>
										<p>
											<span className="font-semibold">Amount:</span>{" "}
											{entry.amount} ETH
										</p>
										<p>
											<span className="font-semibold">To:</span>{" "}
											{`${entry.to_address.slice(0, 6)}...${entry.to_address.slice(-4)}`}
										</p>
										<p>
											<span className="font-semibold">Date:</span>{" "}
											{new Date(entry.created_at).toLocaleString("en-US")}
										</p>
										{entry.dev_donation > 0 && (
											<p>
												<span className="font-semibold">Dev Donation:</span>{" "}
												{entry.dev_donation} ETH
											</p>
										)}
									</div>
									<a
										href={`https://basescan.org/tx/${entry.tx_hash}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-400 hover:text-blue-300 underline flex items-center gap-2"
									>
										<FaCheckCircle />
										<span>View Tx</span>
									</a>
								</li>
							))}
						</ul>
					)}
					<button
						onClick={() => setIsHistoryModalOpen(false)}
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

// fim do app
