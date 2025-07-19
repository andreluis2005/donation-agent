import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(request: Request) {
  try {
    const { command, address, donateToDev } = await request.json();
    console.log("Enviando comando para o agente:", command, "Doar ao dev:", donateToDev);

    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    // Mapear causas pré-definidas para endereços de carteira reais
    const causeAddressMap = {
      education: "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6",
      health: "0x02dE0627054cC5c59821B4Ea2cCE448f64284290",
      environment: "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5",
      social: "0x41Ad38D867049a180231038E38890e2c5F1EECbA",
    };

    // Validar o formato do comando
    const match = command.match(/Donate\s+(\d+\.?\d*)\s+(\w+)\s+to\s+(.+)/i);
    if (!match) {
      return NextResponse.json({ error: "Invalid command format. Use: Donate [amount] [currency] to [cause/address]." });
    }

    const [, value, currency, target] = match;
    const normalizedCurrency = currency.toUpperCase();
    const normalizedTarget = target.toLowerCase();

    // Validar a moeda
    if (!["ETH", "USDC", "USDT"].includes(normalizedCurrency)) {
      return NextResponse.json({ error: "Unsupported currency. Use ETH, USDC, or USDT." });
    }

    // Verificar se é um endereço personalizado ou causa pré-definida
    let toAddress: string;
    if (/^0x[a-fA-F0-9]{40}$/.test(target)) {
      toAddress = target; // Usar endereço personalizado
    } else if (causeAddressMap[normalizedTarget]) {
      toAddress = causeAddressMap[normalizedTarget]; // Usar causa pré-definida
    } else {
      return NextResponse.json({ error: "Invalid cause or address format." });
    }

    // Preparar a mensagem para o DeepSeek
    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `Você é um agente de doações onchain. Sua tarefa é interpretar comandos de doação e retornar **exclusivamente um JSON válido**. O JSON deve conter:
          - "value": o valor em ETH, USDC, ou USDT (número como "0.001").
          - "toAddress": o endereço Ethereum (formato 0x...) fornecido.
          - "currency": a moeda (ETH, USDC, ou USDT) do comando.
          O comando será no formato "Donate <valor> <moeda> to <causa/endereço>", onde <causa> pode ser education, health, environment, social, ou um endereço 0x...
          Retorne o valor, a moeda e o endereço fornecido sem modificações.

          Exemplos de saída:
          - "Donate 0.001 ETH to education" → {"value": "0.001", "toAddress": "0xCaE3E92B39a1965A4B988bE34470Fdc1f49279e6", "currency": "ETH"}
          - "Donate 10 USDC to health" → {"value": "10", "toAddress": "0x02dE0627054cC5c59821B4Ea2cCE448f64284290", "currency": "USDC"}
          - "Donate 5 USDT to environment" → {"value": "5", "toAddress": "0x40Af88bA3D3554e0cCb9Ca3EDc72EbEe4e4C7ae5", "currency": "USDT"}
          - "Donate 0.1 USDT to social" → {"value": "0.1", "toAddress": "0x41Ad38D867049a180231038E38890e2c5F1EECbA", "currency": "USDT"}
          - "Donate 0.0001 ETH to 0x175C0000" → {"value": "0.0001", "toAddress": "0x175C0000", "currency": "ETH"}`
        },
        {
          role: "user",
          content: command,
        },
      ],
      max_tokens: 200,
    });

    let content = response.choices[0].message.content.trim();
    console.log("Resposta bruta do DeepSeek:", content);

    content = content.replace(/```json\s*/, "").replace(/```\s*/, "");

    try {
      const result = JSON.parse(content);
      if (result.value && result.toAddress && result.currency) {
        if (result.toAddress !== toAddress || result.currency !== normalizedCurrency) {
          return NextResponse.json({ error: "Mismatch in address or currency returned by model." });
        }
        return NextResponse.json({ value: result.value, toAddress: result.toAddress as `0x${string}`, currency: result.currency });
      } else if (result.error) {
        return NextResponse.json({ error: result.error });
      }
    } catch (e) {
      return NextResponse.json({
        value,
        toAddress: toAddress as `0x${string}`,
        currency: normalizedCurrency,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}