// Esse arquivo devera ser deletado ainda hoje
import React, { useState } from "react";
import donationSdk from "../sdk/donationSdk";

export default function RecurringDonation() {
	const [amount, setAmount] = useState("5");
	const [freq, setFreq] = useState("monthly");
	const [loading, setLoading] = useState(false);

	async function handleSetup() {
		setLoading(true);
		try {
			await donationSdk.setupRecurring({ amount: Number(amount), freq });
			alert("Doação recorrente agendada");
		} catch (e) {
			console.error(e);
			alert("Erro");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="p-4 border rounded">
			<div className="mb-2">Doação recorrente</div>
			<input
				className="w-full px-2 py-2 border rounded"
				value={amount}
				onChange={(e) => setAmount(e.target.value)}
			/>
			<select
				className="mt-2 w-full px-2 py-2 border rounded"
				value={freq}
				onChange={(e) => setFreq(e.target.value)}
			>
				<option value="weekly">Semanal</option>
				<option value="monthly">Mensal</option>
			</select>
			<button
				className="mt-3 w-full bg-indigo-600 text-white py-2 rounded"
				onClick={handleSetup}
			>
				Agendar
			</button>
		</div>
	);
}
