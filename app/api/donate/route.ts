import { NextResponse } from "next/server";
import { parseEther, isAddress } from "viem";
import { supabase } from "../../../lib/supabase";

export async function POST(request: Request) {
	try {
		const { command, signerData, donateToDev, txHash } = await request.json();

		// Validar o comando
		const match = command.match(
			/doar (\d+\.?\d*)\s*(?:ETH)?\s*(?:para|pra)\s*(0x[a-fA-F0-9]{40})/i,
		);
		if (!match) {
			return NextResponse.json(
				{
					error:
						"Comando inválido. Use: doar <valor> [ETH] para/pra <endereço>",
				},
				{ status: 400 },
			);
		}

		const amount = match[1];
		const toAddress = match[2];

		// Validar endereços
		if (!isAddress(toAddress) || !isAddress(signerData.address)) {
			return NextResponse.json({ error: "Endereço inválido" }, { status: 400 });
		}

		// Validar valor
		const amountFloat = parseFloat(amount);
		if (isNaN(amountFloat) || amountFloat <= 0) {
			return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
		}

		// Converter o valor para Wei
		const amountInWei = parseEther(amount).toString();

		// Salvar a doação no Supabase
		const { error } = await supabase.from("donations").insert({
			user_address: signerData.address,
			amount: amountFloat,
			currency: "ETH",
			to_address: toAddress,
			cause: "custom",
			dev_donation: donateToDev ? amountFloat * 0.1 : 0,
			tx_hash: txHash,
		});

		if (error) {
			return NextResponse.json(
				{ error: `Erro ao salvar doação: ${error.message}` },
				{ status: 500 },
			);
		}

		// Retornar os dados para o cliente processar a transação
		return NextResponse.json(
			{
				toAddress,
				amountInWei,
				currency: "ETH",
			},
			{ status: 200 },
		);
	} catch (error) {
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 500 },
		);
	}
}
