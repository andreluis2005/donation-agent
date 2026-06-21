// app/api/agent/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { isAddress } from "viem";

export async function POST(request: Request) {
	try {
		const { command, donateToDev } = await request.json();
		console.log(
			"Sending command to agent:",
			command,
			"Donate to dev:",
			donateToDev,
		);

		const openai = new OpenAI({
			apiKey: process.env.DEEPSEEK_API_KEY,
			baseURL: "https://api.deepseek.com",
		});

		// Map predefined causes to wallet addresses
		const causeAddressMap: Record<string, `0x${string}`> = {
			education: "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6",
			health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
			environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
			social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
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

		const [, value, currency, target] = match;
		const normalizedCurrency = currency.toUpperCase();
		const normalizedTarget = target.toLowerCase();

		// Validate currency
		if (!["ETH", "USDC", "USDT"].includes(normalizedCurrency)) {
			return NextResponse.json(
				{ error: "Unsupported currency. Use ETH, USDC, or USDT." },
				{ status: 400 },
			);
		}

		// Check if it's a custom address or predefined cause
		let toAddress: `0x${string}`;
		if (isAddress(target)) {
			toAddress = target as `0x${string}`; // Custom address
		} else if (causeAddressMap[normalizedTarget]) {
			toAddress = causeAddressMap[normalizedTarget]; // Predefined cause
		} else {
			return NextResponse.json(
				{ error: "Invalid cause or address format." },
				{ status: 400 },
			);
		}

		// Prepare message for DeepSeek
		const response = await openai.chat.completions.create({
			model: "deepseek-chat",
			messages: [
				{
					role: "system",
					content: `You are an onchain donation agent. Your task is to interpret donation commands and return **exclusively a valid JSON**. The JSON must contain:
          - "value": the amount in ETH, USDC, or USDT (string, e.g., "0.001").
          - "toAddress": the Ethereum address (0x... format) provided or corresponding to the cause.
          - "currency": the currency (ETH, USDC, or USDT) from the command.
          The command will be in the format "Donate <amount> <currency> to <cause/address>", where <cause> can be education, health, environment, social, or a 0x... address.
          Return the amount, currency, and address without modifications.

          Examples of output:
          - "Donate 0.001 ETH to education" → {"value": "0.001", "toAddress": "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6", "currency": "ETH"}
          - "Donate 10 USDC to health" → {"value": "10", "toAddress": "0x02dE0627054cC5c59821B4Ea2cCE448f64284290", "currency": "USDC"}
          - "Donate 5 USDT to environment" → {"value": "5", "toAddress": "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5", "currency": "USDT"}
          - "Donate 0.1 USDT to social" → {"value": "0.1", "toAddress": "0x41Ad38D867049a180231038E38890e2c5F1EECbA", "currency": "USDT"}
          - "Donate 0.0001 ETH to 0x175C0000" → {"value": "0.0001", "toAddress": "0x175C0000", "currency": "ETH"}`,
				},
				{
					role: "user",
					content: command,
				},
			],
			max_tokens: 200,
		});

		const content = response.choices[0]?.message?.content?.trim();
		if (!content) {
			return NextResponse.json(
				{ error: "No valid response from DeepSeek API." },
				{ status: 500 },
			);
		}

		console.log("Raw DeepSeek response:", content);

		const cleanedContent = content
			.replace(/```json\s*/, "")
			.replace(/```\s*/, "");

		try {
			const result = JSON.parse(cleanedContent);
			if (
				result.value &&
				isAddress(result.toAddress) &&
				result.currency &&
				["ETH", "USDC", "USDT"].includes(result.currency)
			) {
				return NextResponse.json({
					value: result.value,
					toAddress: result.toAddress as `0x${string}`,
					currency: result.currency,
				});
			} else {
				return NextResponse.json(
					{ error: "Invalid response from model." },
					{ status: 400 },
				);
			}
		} catch {
			// Fallback to initial parsing if DeepSeek fails
			return NextResponse.json({
				value,
				toAddress: toAddress as `0x${string}`,
				currency: normalizedCurrency,
			});
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
