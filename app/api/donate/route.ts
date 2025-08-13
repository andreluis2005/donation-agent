// app/api/donate/route.ts
import { NextResponse } from "next/server";
import { parseEther, isAddress } from "viem";
import { supabaseServer } from "../../../lib/supabase-server";

export async function POST(request: Request) {
	try {
		const { command, signerData, donateToDev, txHash } = await request.json();

		// Map predefined causes to wallet addresses
		const causeAddressMap: Record<string, `0x${string}`> = {
			education: "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6",
			health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
			environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
			social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
			developer: "0xf2D3CeF68400248C9876f5A281291c7c4603D100",
		};

		// Validate command format
		const match = command.match(
			/Donate\s+(\d+\.?\d*)\s+(ETH|USDC|USDT)\s+to\s+(.+)/i,
		);
		if (!match) {
			return NextResponse.json(
				{
					error:
						"Invalid command format. Use: Donate [amount] [ETH|USDC|USDT] to [cause/address].",
				},
				{ status: 400 },
			);
		}

		const [, amount, currency, target] = match;
		const normalizedCurrency = currency.toUpperCase();
		const normalizedTarget = target.toLowerCase();

		// Validate currency
		if (!["ETH", "USDC", "USDT"].includes(normalizedCurrency)) {
			return NextResponse.json(
				{ error: "Unsupported currency. Use ETH, USDC, or USDT." },
				{ status: 400 },
			);
		}

		// Determine address and cause
		let toAddress: `0x${string}`;
		let cause: string;
		if (isAddress(target)) {
			toAddress = target as `0x${string}`;
			cause = donateToDev ? "developer" : "custom";
		} else if (causeAddressMap[normalizedTarget]) {
			toAddress = causeAddressMap[normalizedTarget];
			cause = normalizedTarget;
		} else {
			return NextResponse.json(
				{ error: "Invalid cause or address format." },
				{ status: 400 },
			);
		}

		// Validate addresses
		if (!isAddress(toAddress) || !isAddress(signerData.address)) {
			return NextResponse.json({ error: "Invalid address." }, { status: 400 });
		}

		// Validate amount
		const amountFloat = parseFloat(amount);
		if (isNaN(amountFloat) || amountFloat <= 0) {
			return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
		}

		// Convert amount to Wei (only for ETH)
		const amountInWei =
			normalizedCurrency === "ETH" ? parseEther(amount).toString() : undefined;

		// Save donation to Supabase
		const supabase = await supabaseServer();
		const { error } = await supabase.from("donations").insert({
			user_address: signerData.address,
			amount: amountFloat,
			currency: normalizedCurrency,
			to_address: toAddress,
			cause,
			dev_donation: donateToDev ? amountFloat : 0,
			tx_hash: txHash,
			created_at: new Date().toISOString(),
		});

		if (error) {
			return NextResponse.json(
				{ error: `Error saving donation: ${error.message}` },
				{ status: 500 },
			);
		}

		// Return data for client to process transaction
		return NextResponse.json(
			{
				toAddress,
				amountInWei,
				currency: normalizedCurrency,
			},
			{ status: 200 },
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
