// Esse arquivo devera ser deletado
import { useState } from "react";
import { connectWallet, donateToken } from "./donationService";

export default function DonationBox() {
	const [wallet, setWallet] = useState<string | null>(null);
	const [amount, setAmount] = useState("1");
	const [status, setStatus] = useState("");

	// 👉 configure estes 3 valores
	const TOKEN_ADDRESS = "0x000000..."; // seu token / USDC
	const RECEIVER_ADDRESS = "0x000000..."; // carteira / contrato
	const DECIMALS = 6; // USDC=6 | ERC=18

	async function handleConnect() {
		const acc = await connectWallet();
		setWallet(acc);
	}

	async function handleDonate() {
		if (!wallet) {
			setStatus("Conecte a carteira primeiro");
			return;
		}

		setStatus("Processando...");
		const res = await donateToken(
			TOKEN_ADDRESS,
			RECEIVER_ADDRESS,
			Number(amount),
			DECIMALS,
		);

		if (res.success) {
			setStatus(`Doação enviada! 🔥\nTx: ${res.txHash}`);
		} else {
			setStatus(`❌ Erro: ${res.error}`);
		}
	}

	return (
		<div
			style={{
				padding: 20,
				border: "1px solid #555",
				borderRadius: 10,
				width: 320,
			}}
		>
			<h3>Doação</h3>

			{!wallet ? (
				<button onClick={handleConnect}>Conectar carteira</button>
			) : (
				<>
					<div style={{ marginBottom: 10 }}>
						Carteira: {wallet.slice(0, 6)}...{wallet.slice(-4)}
					</div>

					<input
						style={{
							width: "100%",
							padding: 8,
							borderRadius: 6,
							marginBottom: 10,
						}}
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="Valor"
					/>

					<button onClick={handleDonate}>Doar</button>

					{status && (
						<p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{status}</p>
					)}
				</>
			)}
		</div>
	);
}
