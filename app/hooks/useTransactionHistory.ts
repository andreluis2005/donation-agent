"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "../../lib/supabase-client"; // Ajustado para o nome correto

export function useTransactionHistory(address?: `0x${string}`) {
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
	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function fetchDonations() {
			if (!address) {
				if (isMounted) setHistory([]);
				return;
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

				if (isMounted) {
					if (fetchError) {
						setError(`Error fetching donations: ${fetchError.message}`);
						setHistory([]);
					} else {
						// Normaliza user_address para garantir que seja string
						const normalizedData =
							data?.map((item) => ({
								...item,
								user_address: item.user_address || "",
							})) || [];
						setHistory(normalizedData);
					}
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				if (isMounted) {
					setError(`Failed to fetch donations: ${errorMessage}`);
					setHistory([]);
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		}

		fetchDonations();

		return () => {
			isMounted = false;
		};
	}, [address]);

	const refetchHistory = async () => {
		if (!address) return;
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
				setError(`Error refetching donations: ${fetchError.message}`);
				setHistory([]);
			} else {
				const normalizedData =
					data?.map((item) => ({
						...item,
						user_address: item.user_address || "",
					})) || [];
				setHistory(normalizedData);
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Unknown error";
			setError(`Failed to refetch donations: ${errorMessage}`);
			setHistory([]);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		history,
		setHistory,
		isHistoryModalOpen,
		setIsHistoryModalOpen,
		isLoading,
		error,
		refetchHistory,
	};
}
