// app/components/DevDonationModal.tsx
"use client";

import { useCallback } from "react";
import { FaTimes } from "react-icons/fa";

export default function DevDonationModal({
	isDevDonationModalOpen,
	setIsDevDonationModalOpen,
	devDonationAmount,
	setDevDonationAmount,
	setMessage,
	onConfirm,
	isDarkMode,
}: {
	isDevDonationModalOpen: boolean;
	setIsDevDonationModalOpen: (value: boolean) => void;
	devDonationAmount: string;
	setDevDonationAmount: (value: string) => void;
	setMessage: (value: string | null) => void;
	onConfirm: (amount: string) => Promise<void>;
	isDarkMode: boolean;
}) {
	const handleConfirm = useCallback(async () => {
		if (!devDonationAmount || parseFloat(devDonationAmount) <= 0) {
			setMessage("Please enter a valid amount.");
			return;
		}
		await onConfirm(devDonationAmount);
	}, [devDonationAmount, onConfirm, setMessage]);

	return (
		isDevDonationModalOpen && (
			<div
				className={`fixed inset-0 ${isDarkMode ? "bg-black bg-opacity-70" : "bg-gray-900 bg-opacity-50"} flex items-center justify-center z-50 transition-all duration-300`}
				role="dialog"
				aria-labelledby="dev-donation-modal-title"
				aria-modal="true"
			>
				<div
					className={`w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800 text-gray-100 border-gray-600 border" : "bg-white text-gray-900 border-gray-200 border"} animate-slide-in`}
				>
					<div className="flex justify-between items-center mb-4">
						<h3 id="dev-donation-modal-title" className="text-xl font-semibold">
							Donate to Developer
						</h3>
						<button
							onClick={() => {
								setIsDevDonationModalOpen(false);
								setDevDonationAmount("");
							}}
							className="text-gray-400 hover:text-gray-200 focus:outline-none"
							aria-label="Close developer donation modal"
						>
							<FaTimes className="w-6 h-6" />
						</button>
					</div>
					<p className="mb-4 text-gray-400">
						Support the developer and help keep this project running! Enter your
						donation amount in ETH below. Thank you!
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
							onClick={handleConfirm}
							className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
							aria-label="Confirm developer donation"
							disabled={
								!devDonationAmount || parseFloat(devDonationAmount) <= 0
							}
						>
							Yes
						</button>
						<button
							onClick={() => {
								setIsDevDonationModalOpen(false);
								setDevDonationAmount("");
							}}
							className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
							aria-label="Skip developer donation"
						>
							No
						</button>
					</div>
				</div>
			</div>
		)
	);
}
