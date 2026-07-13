# Contexto do projeto

## Objetivo

Onchain Donation é uma aplicação Next.js para doações onchain a causas predefinidas ou endereços informados pelo usuário. A rede principal de desenvolvimento atual é Base Sepolia.

## Arquitetura atual

| Área | Implementação | Localização |
| --- | --- | --- |
| Interface | Next.js 15, React 18 e Tailwind | `app/` |
| Carteira/transações | Wagmi, Viem e OnchainKit | `app/hooks/useDonationLogic.ts` |
| Interpretação de comando livre | DeepSeek por API compatível com OpenAI | `app/api/agent/route.ts` |
| Registro de doações | Supabase, tabela `donations` | `app/api/donate/route.ts` |
| Configuração de cadeias e tokens | Base e outras cadeias suportadas | `lib/chains.ts` |

## Fluxo de doação

1. O usuário escolhe o modo simples ou escreve um comando livre.
2. No modo livre, `/api/agent` retorna apenas `{ value, toAddress, currency }`.
3. O navegador solicita a assinatura/transação à carteira.
4. Após transmitir a transação, o navegador envia os dados para `/api/donate`.
5. O endpoint grava a doação no Supabase com `tx_hash` e `chain_id`.

O LLM não assina transações, não controla a carteira e não é a fonte de verdade das doações.

## Integrações e segredos

As variáveis ficam em `.env.local` e nunca devem ser registradas no Git. As integrações conhecidas são Coinbase Developer Platform, Supabase e DeepSeek. Antes de introduzir um novo provedor, documente as variáveis necessárias sem registrar valores.

## Comandos úteis

```bash
npm run dev
npm run build
```

## Pontos de atenção

- As alterações onchain exigem confirmação explícita do usuário e validação na rede adequada.
- Valores monetários e endereços devem ser validados no servidor e no cliente.
- A aplicação contém uma mudança local não commitada em `app/page.tsx` que deve ser preservada até o responsável confirmá-la.

