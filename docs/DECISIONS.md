# Decisões técnicas

Registre aqui decisões duradouras. Use uma entrada por decisão, com data, contexto, decisão e consequência.

## 2026-07-12 — Memória de projeto independente de LLM

**Contexto:** o desenvolvimento pode alternar entre Claude, Gemini, Codex ou outro assistente por limite de créditos, contexto ou preferência.

**Decisão:** manter contexto, decisões e trabalho em andamento em arquivos versionados no repositório (`AGENTS.md` e `docs/`), complementados por commits pequenos e descritivos.

**Consequência:** nenhum provedor de IA é fonte de verdade do projeto. Uma nova IA deve começar pela leitura desses arquivos e do estado do Git.

## 2026-07-12 — LLM isolado da execução financeira

**Contexto:** comandos em linguagem natural precisam ser interpretados sem transferir poder de execução ao modelo.

**Decisão:** o endpoint de agente retorna dados estruturados; a carteira do usuário assina a transação e o Supabase persiste o registro.

**Consequência:** trocar o provedor de LLM não altera transações ou histórico já registrados. A implementação deve manter validação estrita da saída do modelo.

