// lib/chains.ts
import { base, baseSepolia, celo, celoAlfajores } from "wagmi/chains";

export const supportedChains = [
	baseSepolia,
	base,
	celoAlfajores,
	celo,
] as const;

export const chainIdToName: Record<number, string> = {
	[baseSepolia.id]: "Base Sepolia",
	[base.id]: "Base Mainnet",
	[celoAlfajores.id]: "Celo Alfajores",
	[celo.id]: "Celo Mainnet",
};

// NOVO: define quais moedas aparecem em cada rede
export const currenciesByChain: Record<number, string[]> = {
	[baseSepolia.id]: ["ETH", "USDC", "USDT"],
	[base.id]: ["ETH", "USDC", "USDT"],
	[celoAlfajores.id]: ["CELO", "USDC", "USDT", "cUSD"],
	[celo.id]: ["CELO", "USDC", "USDT", "cUSD"],
};

export const tokenAddresses: Record<
	number,
	{
		USDC: `0x${string}`;
		USDT: `0x${string}`;
		cUSD?: `0x${string}`;
		CELO?: `0x${string}`;
	}
> = {
	[baseSepolia.id]: {
		USDC: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
		USDT: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
	},
	[base.id]: {
		USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
		USDT: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
	},
	[celoAlfajores.id]: {
		USDC: "0x2F25deB3848C207B8e0c34035B3Ba7fC157602b5",
		USDT: "0x480a0f4e360E8964f0F423b87d89E7f3e0A9452D",
		cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
	},
	[celo.id]: {
		USDC: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a",
		USDT: "0x480a0f4e360E8964f0F423b87d89E7f3e0A9452D",
		cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
		CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
	},
};
