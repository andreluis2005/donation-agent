// app/hooks/useTransactionHistory.ts
"use client";

import { useState, useCallback } from "react";
import { createSupabaseClient } from "../../lib/supabase-client";

export function useTransactionHistory(address?: `0x${string}`) {
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchDonations = useCallback(async () => {
		if (!address) {
			return [];
		}

		setIsLoading(true);
		setError(null);

		try {
			const supabase = createSupabaseClient();
			const { data, error: fetchError } = await supabase
				.from("donations")
				.select("*")
				.eq("user_address", address)
				.order("created_at", { ascending: false });

			if (fetchError) {
				throw new Error(`Error fetching donations: ${fetchError.message}`);
			}

			const normalizedData =
				data?.map((item) => ({
					...item,
					user_address: item.user_address || "",
					amount: item.amount.toString(),
				})) || [];
			return normalizedData;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			setError(`Failed to fetch donations: ${errorMessage}`);
			console.error("Fetch History Error:", errorMessage);
			return [];
		} finally {
			setIsLoading(false);
		}
	}, [address]);

	const refetchHistory = useCallback(async () => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		return await fetchDonations();
	}, [fetchDonations]);

	return {
		isHistoryModalOpen,
		setIsHistoryModalOpen,
		isLoading,
		error,
		fetchDonations,
		refetchHistory,
	};
}
