// app/hooks/useWalletBalance.ts
"use client";

import { useBalance, useAccount } from "wagmi";

export function useWalletBalance() {
	const { address } = useAccount();
	const { data: ethBalance, isLoading: isEthBalanceLoading } = useBalance({
		address,
	});
	const { data: usdcBalance, isLoading: isUsdcBalanceLoading } = useBalance({
		address,
		token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
	});
	const { data: usdtBalance, isLoading: isUsdtBalanceLoading } = useBalance({
		address,
		token: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
	});

	return {
		ethBalance,
		usdcBalance,
		usdtBalance,
		isEthBalanceLoading,
		isUsdcBalanceLoading,
		isUsdtBalanceLoading,
	};
}
