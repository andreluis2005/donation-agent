// app/api/donate/route.ts
import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { supabaseServer } from "../../../lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      command,
      signerData,
      donateToDev = false,
      txHash,
      chainId, // ← NOVO: vem do frontend agora
    } = body;

    // Validação básica
    if (!command || !signerData?.address || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const causeAddressMap: Record<string, `0x${string}`> = {
      education: "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6",
      health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
      environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
      social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
      developer: "0xf2D3CeF68400248C9876f5A281291c7c4603D100",
    };

    // Extrai valor, moeda e destino do comando
    const match = command.match(/Donate\s+(\d+\.?\d*)\s+(ETH|USDC|USDT)\s+to\s+(.+)/i);
    if (!match) {
      return NextResponse.json(
        { error: "Formato inválido. Use: Donate 0.01 ETH to education" },
        { status: 400 }
      );
    }

    const [, rawAmount, currency, target] = match;
    const amount = parseFloat(rawAmount);
    const normalizedCurrency = currency.toUpperCase();
    const targetLower = target.trim().toLowerCase();

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    if (!["ETH", "USDC", "USDT"].includes(normalizedCurrency)) {
      return NextResponse.json({ error: "Moeda não suportada" }, { status: 400 });
    }

    // Define endereço de destino e causa
    let toAddress: `0x${string}`;
    let cause: string;

    if (isAddress(target)) {
      toAddress = target as `0x${string}`;
      cause = donateToDev ? "developer" : "custom";
    } else if (causeAddressMap[targetLower]) {
      toAddress = causeAddressMap[targetLower];
      cause = targetLower;
    } else {
      return NextResponse.json(
        { error: "Causa ou endereço não encontrado" },
        { status: 400 }
      );
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
