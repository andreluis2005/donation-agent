// app/api/donate/route.ts
import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { supabaseServer } from "../../../lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      amount: rawAmount,
      currency,
      toAddress,
      cause = "custom",
      signerData,
      donateToDev = false,
      txHash,
      chainId,
    } = body;

    // Validação básica
    if (!signerData?.address || !txHash || !currency || !toAddress || rawAmount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amount = parseFloat(rawAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    const normalizedCurrency = currency.toUpperCase();
    if (!["ETH", "USDC", "USDT", "CELO", "cUSD"].includes(normalizedCurrency)) {
      return NextResponse.json({ error: "Moeda não suportada" }, { status: 400 });
    }

    if (!isAddress(signerData.address) || !isAddress(toAddress)) {
      return NextResponse.json({ error: "Endereço inválido" }, { status: 400 });
    }

    // Salva no Supabase com chain_id
    const supabase = await supabaseServer();
    const { error } = await supabase.from("donations").insert({
      user_address: signerData.address,
      amount: amount,
      currency: normalizedCurrency,
      to_address: toAddress,
      cause: cause,
      dev_donation: donateToDev ? amount : 0,
      tx_hash: txHash,
      chain_id: Number(chainId) || 84532, // ← GRAVA A REDE CORRETA!
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Erro no Supabase:", error);
      return NextResponse.json(
        { error: "Falha ao salvar doação no banco de dados" },
        { status: 500 }
      );
    }

    // Resposta para o frontend (não precisa mais de amountInWei aqui)
    return NextResponse.json(
      {
        success: true,
        toAddress,
        currency: normalizedCurrency,
        amount,
        chainId: Number(chainId) || 84532,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro na API /api/donate:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
