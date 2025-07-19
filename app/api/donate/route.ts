import { NextResponse } from "next/server";
import { parseEther } from "viem";
import { supabase } from "../../../lib/supabase";


export async function POST(request: Request) {
  try {
    const { command, signerData, donateToDev, txHash } = await request.json();

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

    // Converter o valor para Wei
    const amountInWei = parseEther(amount).toString();

    // Salvar a doação no Supabase
    const { error } = await supabase.from("donations").insert({
      user_address: signerData.address,
      amount: parseFloat(amount),
      currency: "ETH",
      to_address: toAddress,
      cause: "custom", // Ajuste conforme necessário
      dev_donation: donateToDev ? parseFloat(amount) * 0.1 : 0,
      tx_hash: txHash,
    });

    if (error) {
      return NextResponse.json({ error: `Erro ao salvar doação: ${error.message}` }, { status: 500 });
    }

    // Retornar os dados para o cliente processar a transação
    return NextResponse.json(
      {
        toAddress,
        amountInWei,
        currency: "ETH",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}