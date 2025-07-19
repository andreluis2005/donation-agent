import { NextResponse } from "next/server";
import { parseEther } from "viem";

export async function POST(request: Request) {
  try {
    const { command, signerData } = await request.json();

    // Validar o comando
    const match = command.match(/doar (\d+\.?\d*)\s*(?:ETH)?\s*(?:para|pra)\s*(0x[a-fA-F0-9]{40})/i);
    if (!match) {
      return NextResponse.json(
        { error: "Comando inválido. Use: doar <valor> [ETH] para/pra <endereço>" },
        { status: 400 }
      );
    }

    const amount = match[1];
    const toAddress = match[2];

    // Converter o valor para Wei (para o cliente usar)
    const amountInWei = parseEther(amount).toString();

    // Retornar os dados para o cliente processar a transação
    return NextResponse.json(
      {
        toAddress,
        amountInWei,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}