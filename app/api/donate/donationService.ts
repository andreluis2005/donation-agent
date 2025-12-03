//esse arquivo devera ser deletado
import { BrowserProvider, Contract, parseUnits } from "ethers";

export type DonationResult = {
	txHash?: string;
	error?: string;
	success: boolean;
};

/**
 * Conecta carteira (MetaMask / Coinbase / Brave)
 */
export async function connectWallet(): Promise<string | null> {
	try {
		if (!window.ethereum) return null;

		const provider = new BrowserProvider(window.ethereum);
		const accounts = await provider.send("eth_requestAccounts", []);
		return accounts[0];
	} catch (e) {
		console.error(e);
		return null;
	}
}

/**
 * Doação via token ERC20
 * @param tokenAddress contrato do token
 * @param receiver endereço destino
 * @param amount quantidade (ex: 1.5)
 * @param decimals casas decimais (USDC=6 / ERC20=18)
 */
export async function donateToken(
	tokenAddress: string,
	receiver: string,
	amount: number,
	decimals: number,
): Promise<DonationResult> {
	try {
		if (!window.ethereum) {
			return { success: false, error: "Carteira não encontrada" };
		}

		const provider = new BrowserProvider(window.ethereum);
		const signer = await provider.getSigner();

		const erc20ABI = [
			"function transfer(address to, uint256 amount) external returns (bool)",
		];

		const contract = new Contract(tokenAddress, erc20ABI, signer);
		const value = parseUnits(amount.toString(), decimals);

		const tx = await contract.transfer(receiver, value);
		await tx.wait();

		return { success: true, txHash: tx.hash };
	} catch (error: any) {
		return {
			success: false,
			error: error?.message || "Erro desconhecido",
		};
	}
}
