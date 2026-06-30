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

		// Tentativa rápida de match Regex (otimização e economia de tokens)
		const match = command.match(
			/Donate\s+(\d+\.?\d*)\s+(ETH|CELO|USDC|USDT|cUSD)\s+to\s+(0x[a-fA-F0-9]{40}|education|health|environment|social|developer)/i,
		);

		if (match) {
			const [, value, currency, target] = match;
			const normalizedCurrency = currency.toUpperCase();
			const targetLower = target.toLowerCase();
			const toAddress = isAddress(target) 
				? (target as `0x${string}`) 
				: causeAddressMap[targetLower];

			if (toAddress) {
				console.log("Fast-path match com sucesso!");
				return NextResponse.json({
					value,
					toAddress,
					currency: normalizedCurrency,
				});
			}
		}

		console.log("Chamando DeepSeek para interpretar comando livre...");

		// Se a regex falhar, chamamos a IA para interpretar linguagem natural livre
		const response = await openai.chat.completions.create({
			model: "deepseek-chat",
			messages: [
				{
					role: "system",
					content: `Você é um agente de doações onchain. Sua tarefa é interpretar comandos de doação em linguagem natural e extrair os dados estruturados em JSON.
					
					Mapeamento de Causas e Endereços:
					- "education" (educação) -> "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6"
					- "health" (saúde) -> "0x02dE0627054cC5c59821B4Ea2cCE448f64284290"
					- "environment" (meio ambiente) -> "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5"
					- "social" (impacto social) -> "0x41Ad38D867049a180231038E38890e2c5F1EECbA"
					- "developer" (desenvolvedor) -> "0xf2D3CeF68400248C9876f5A281291c7c4603D100"

					Se o usuário especificar uma dessas causas, você deve retornar o endereço correspondente no campo "toAddress".
					Se o usuário especificar um endereço Ethereum (formato 0x...), retorne ele mesmo no campo "toAddress".
					
					Você deve retornar EXCLUSIVAMENTE um objeto JSON válido (sem markdown, sem blocos de código), contendo:
					- "value": a quantidade a ser doada (string contendo número, ex: "0.05").
					- "toAddress": o endereço hexadecimal de destino (0x...).
					- "currency": a moeda (ETH, CELO, USDC, USDT ou cUSD) extraída do comando.

					Caso não seja possível identificar esses dados, retorne um JSON com {"error": "Comando não compreendido"}.`,
				},
				{
					role: "user",
					content: command,
				},
			],
			max_tokens: 200,
			response_format: { type: "json_object" },
		});

		const content = response.choices[0]?.message?.content?.trim();
		if (!content) {
			return NextResponse.json(
				{ error: "No valid response from DeepSeek API." },
				{ status: 500 },
			);
		}

		console.log("DeepSeek response:", content);

		try {
			const result = JSON.parse(content);
			if (result.error) {
				return NextResponse.json({ error: result.error }, { status: 400 });
			}

			if (
				result.value &&
				isAddress(result.toAddress) &&
				result.currency &&
				["ETH", "CELO", "USDC", "USDT", "cUSD"].includes(result.currency.toUpperCase())
			) {
				return NextResponse.json({
					value: result.value,
					toAddress: result.toAddress as `0x${string}`,
					currency: result.currency.toUpperCase(),
				});
			} else {
				return NextResponse.json(
					{ error: "Dados extraídos pela IA são inválidos ou incompletos." },
					{ status: 400 },
				);
			}
		} catch {
			return NextResponse.json(
				{ error: "Falha ao processar o formato do comando." },
				{ status: 400 },
			);
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
