# Protocolo de passagem entre LLMs

## Como iniciar

1. Execute `git status --short` e preserve mudanças existentes.
2. Leia `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/DECISIONS.md` e `docs/ACTIVE_TASK.md`.
3. Leia apenas os arquivos relacionados à tarefa solicitada.
4. Confirme a tarefa e os critérios de aceite antes de mudanças de alto impacto.

## Durante a implementação

- Faça mudanças pequenas, coesas e fáceis de revisar.
- Não assuma que uma resposta anterior de outra IA é correta: confirme no código e na documentação.
- Registre uma decisão em `DECISIONS.md` quando ela tiver efeito futuro relevante.
- Não exponha segredos de ambiente, nem copie `.env.local` para documentação, logs ou commits.

## Antes de encerrar ou transferir

Atualize `docs/ACTIVE_TASK.md` com:

- o que foi feito;
- arquivos alterados;
- o que falta e por quê;
- como validar e o resultado da última validação;
- riscos, bloqueios ou decisões que o próximo responsável precisa conhecer.

Faça um commit descritivo quando a unidade de trabalho estiver concluída e houver autorização para isso. Se precisar parar no meio, deixe o estado e os próximos passos explícitos no arquivo de tarefa.

