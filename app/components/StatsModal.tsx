// app/components/StatsModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { createSupabaseClient } from "../../lib/supabase-client";
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

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
);

const causeNameMap = {
	education: "Education",
	health: "Health",
	environment: "Environment",
	social: "Social Impact",
	developer: "Developer Donation",
};

const causeAddressMap = {
	education: "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6",
	health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
	environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
	social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
	developer: "0xf2D3CeF68400248C9876f5A281291c7c4603D100",
};

export default function StatsModal({
	isStatsModalOpen,
	setIsStatsModalOpen,
	filterCause,
	setFilterCause,
	filterCurrency,
	setFilterCurrency,
	isDarkMode,
}: {
	isStatsModalOpen: boolean;
	setIsStatsModalOpen: (value: boolean) => void;
	filterCause: string;
	setFilterCause: (value: string) => void;
	filterCurrency: string;
	setFilterCurrency: (value: string) => void;
	isDarkMode: boolean;
}) {
	const [history, setHistory] = useState<
		{ amount: string; currency: string; cause: string; to_address: string }[]
	>([]);

	useEffect(() => {
		async function fetchDonations() {
			const supabase = createSupabaseClient();
			const { data, error } = await supabase
				.from("donations")
				.select("amount, currency, cause, to_address")
				.order("created_at", { ascending: false });
			if (error) {
				console.error("Error fetching donations:", error.message);
			} else {
				setHistory(data || []);
			}
		}
		fetchDonations();
	}, []);

	const filteredStats = useMemo(() => {
		const getStatsData = () => {
			const stats: Record<
				keyof typeof causeNameMap,
				{ ETH: number; USDC: number; USDT: number }
			> = {
				education: { ETH: 0, USDC: 0, USDT: 0 },
				health: { ETH: 0, USDC: 0, USDT: 0 },
				environment: { ETH: 0, USDC: 0, USDT: 0 },
				social: { ETH: 0, USDC: 0, USDT: 0 },
				developer: { ETH: 0, USDC: 0, USDT: 0 },
			};

			history.forEach((entry) => {
				const causeKey = (
					Object.keys(causeNameMap) as (keyof typeof causeNameMap)[]
				).find(
					(key) =>
						causeNameMap[key].toLowerCase() === entry.cause.toLowerCase() ||
						(entry.cause === "Developer Donation" && key === "developer") ||
						causeAddressMap[
							key as keyof typeof causeAddressMap
						]?.toLowerCase() === entry.to_address.toLowerCase(),
				);
				if (
					causeKey &&
					["ETH", "USDC", "USDT"].includes(entry.currency) &&
					stats[causeKey]
				) {
					stats[causeKey][
						entry.currency as keyof (typeof stats)[keyof typeof causeNameMap]
					] += parseFloat(entry.amount);
				}
			});

			return stats;
		};

		const stats = getStatsData();
		const filtered: {
			cause: string;
			ETH: number;
			USDC: number;
			USDT: number;
		}[] = [];

		const causes = filterCause
			? [filterCause as keyof typeof causeNameMap]
			: ["education", "health", "environment", "social", "developer"];
		const currencies = filterCurrency ? [filterCurrency] : ["ETH"];

		causes.forEach((cause) => {
			const entry = {
				cause: causeNameMap[cause as keyof typeof causeNameMap],
				ETH: currencies.includes("ETH")
					? stats[cause as keyof typeof stats].ETH
					: 0,
				USDC: stats[cause as keyof typeof stats].USDC,
				USDT: stats[cause as keyof typeof stats].USDT,
			};
			filtered.push(entry);
		});

		return filtered;
	}, [filterCause, filterCurrency, history]);

	const exportToCSV = () => {
		const csv = [
			["Cause", "ETH"].join(","),
			...filteredStats.map((stat) =>
				[stat.cause, stat.ETH.toFixed(4)].join(","),
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

	const chartData = {
		labels: filteredStats.map((s) => s.cause),
		datasets: [
			{
				label: "ETH",
				data: filteredStats.map((s) => s.ETH),
				backgroundColor: "rgba(59, 130, 246, 0.6)",
				borderColor: "rgba(59, 130, 246, 1)",
				borderWidth: 1,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top" as const,
				labels: { color: isDarkMode ? "#D1D5DB" : "#374151" },
			},
			title: {
				display: true,
				text: `Total Donations by Cause (${filterCause || "All"} / ETH)`,
				color: isDarkMode ? "#D1D5DB" : "#374151",
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: { color: isDarkMode ? "#D1D5DB" : "#374151" },
			},
			x: { ticks: { color: isDarkMode ? "#D1D5DB" : "#374151" } },
		},
	};

	return (
		isStatsModalOpen && (
			<div
				className={`fixed inset-0 ${isDarkMode ? "bg-black bg-opacity-70" : "bg-gray-900 bg-opacity-50"} flex items-center justify-center transition-all duration-300 text-gray-100`}
			>
				<div
					className={`w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-lg shadow-md ${isDarkMode ? "bg-gradient-to-br from-gray-900 to-gray-800" : "bg-white"} transition-all duration-300 transform scale-100 opacity-100`}
				>
					<h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-center leading-snug">
						Donation Statistics
					</h3>
					<div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
						<select
							value={filterCause}
							onChange={(e) => setFilterCause(e.target.value)}
							className={`w-full sm:w-1/3 p-2 rounded-lg ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}
							aria-label="Filter by cause"
						>
							<option value="">All Causes</option>
							<option value="education">Education</option>
							<option value="health">Health</option>
							<option value="environment">Environment</option>
							<option value="social">Social Impact</option>
							<option value="developer">Developer Donation</option>
						</select>
						<select
							value={filterCurrency}
							onChange={(e) => setFilterCurrency(e.target.value)}
							className={`w-full sm:w-1/3 p-2 rounded-lg ${isDarkMode ? "bg-gray-900/80 border-gray-600 text-gray-100" : "bg-white border-gray-200 text-gray-900"}`}
							aria-label="Filter by currency"
						>
							<option value="">All Currencies</option>
							<option value="ETH">ETH</option>
						</select>
					</div>
					{filteredStats.length > 0 ? (
						<div className="w-full h-64">
							<Bar data={chartData} options={chartOptions} />
						</div>
					) : (
						<p className="text-center text-gray-400">No data available.</p>
					)}
					<div className="text-center mt-4 space-y-2">
						{filteredStats.map((stat) => (
							<p key={stat.cause}>
								{stat.cause}: {stat.ETH.toFixed(4)} ETH
							</p>
						))}
					</div>
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
		)
	);
}
