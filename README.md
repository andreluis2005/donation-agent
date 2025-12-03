# 🌍 Donation Agent  

**PT-BR** | **[EN](#english-version)**  

---

## 🇧🇷 Versão em Português  

**Donation Agent** é um aplicativo de **doações onchain** que permite enviar **ETH** para causas pré-definidas (Educação, Saúde, Meio Ambiente, Impacto Social) ou para **endereços personalizados**, rodando na **Base Sepolia**.  

O projeto combina **usabilidade, blockchain e inteligência artificial**, trazendo impacto real para iniciativas sociais.  

---

### ✨ Funcionalidades  

- 🔗 **Integração de Carteira**: Suporte a **MetaMask** e **Coinbase Wallet** via **Wagmi**, com troca automática para Base Sepolia.  
- 💸 **Doações em ETH**: Envio direto para causas específicas ou endereços customizados, com rastreamento onchain.  
- 🎛️ **Modos de Doação**:  
  - **Simple Mode** → seleção via formulário.  
  - **Custom Mode** → interpretação de comandos de texto por **IA (DeepSeek)**.  
- 📊 **Histórico & Estatísticas**: Registros no **Supabase**, com histórico de transações e gráficos de barras em tempo real.  
- 🌓 **Design Adaptativo**: Suporte a **dark/light mode** automático.  
- ⌨️ **Atalhos de Teclado**: Seleção rápida de causas via teclas (1, 2, 3...).  
- ✅ **Feedback Visual**: Ícones de carregamento, mensagens de sucesso/erro e links diretos para o **Basescan**.  
-Breve estaremos incluindo x402

---

### 🛠️ Como Rodar o Projeto  

#### 1️⃣ Clone o repositório  
```bash
git clone https://github.com/andreluis2005/donation-agent.git


2️⃣ Instale as dependências
cd donation-agent
npm install

3️⃣ Configure as variáveis de ambiente

Crie um arquivo .env.local na raiz do projeto com:

NEXT_PUBLIC_CDP_API_KEY=your_value
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84531
NEXT_PUBLIC_CDP_PROJECT_ID=your_value
CDP_API_KEY=your_value
SUPABASE_JWT_SECRET=your_value
DEEPSEEK_API_KEY=your_value
SUPABASE_SERVICE_ROLE_KEY=your_value
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value


🔑 Obtenha os valores no Supabase, DeepSeek e Coinbase Developer Platform.

4️⃣ Execute a aplicação
npm run dev

5️⃣ Acesse no navegador

👉 http://localhost:3000

📦 Requisitos

Node.js v18+

MetaMask ou Coinbase Wallet configurados na Base Sepolia

ETH de faucet (Thirdweb, Alchemy, etc.)

Chaves de API do Supabase, DeepSeek e Coinbase Developer Platform

🤝 Contribuição

Este projeto é open-source sob a licença MIT.
Contribuições são muito bem-vindas!

Abra uma issue para sugerir melhorias ✨

Envie um pull request 🚀

📜 Licença

Este projeto está licenciado sob a MIT License.

💙 Criado para facilitar doações onchain e promover impacto social real na Web3.

🇺🇸 English Version

Donation Agent is an onchain donation application that enables users to send ETH to predefined causes (Education, Health, Environment, Social Impact) or to custom addresses, running on the Base Sepolia network.

The project combines usability, blockchain, and artificial intelligence, delivering real-world impact for social initiatives.

✨ Features

🔗 Wallet Integration: Supports MetaMask and Coinbase Wallet via Wagmi, with automatic switch to Base Sepolia.

💸 ETH Donations: Directly send to specific causes or custom addresses, with onchain tracking.

🎛️ Donation Modes:

Simple Mode → form-based selection.

Custom Mode → AI-powered text command interpretation (DeepSeek).

📊 History & Stats: Stored in Supabase, with transaction history and real-time bar chart statistics.

🌓 Adaptive Design: Supports automatic dark/light mode.

⌨️ Keyboard Shortcuts: Quick cause selection via number keys (1, 2, 3...).

✅ Visual Feedback: Loading icons, success/error messages, and direct links to Basescan.

🛠️ How to Run the Project
1️⃣ Clone the repository
git clone https://github.com/andreluis2005/donation-agent.git

2️⃣ Install dependencies
cd donation-agent
npm install

3️⃣ Configure environment variables

Create a .env.local file in the project root:

NEXT_PUBLIC_CDP_API_KEY=your_value
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_CHAIN_ID=84531
NEXT_PUBLIC_CDP_PROJECT_ID=your_value
CDP_API_KEY=your_value
SUPABASE_JWT_SECRET=your_value
DEEPSEEK_API_KEY=your_value
SUPABASE_SERVICE_ROLE_KEY=your_value
NEXT_PUBLIC_SUPABASE_URL=https://your_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value


🔑 Get these values from Supabase, DeepSeek, and Coinbase Developer Platform.

4️⃣ Start the application
npm run dev

5️⃣ Open in your browser

👉 http://localhost:3000

📦 Requirements

Node.js v18+

MetaMask or Coinbase Wallet configured for Base Sepolia

ETH from a faucet (Thirdweb, Alchemy, etc.)

API keys from Supabase, DeepSeek, and Coinbase Developer Platform

🤝 Contribution

This project is open-source under the MIT License.
Contributions are welcome!

Open an issue to suggest improvements ✨

Submit a pull request 🚀

📜 License

This project is licensed under the MIT License.

💙 Built to enable onchain donations and promote real social impact in Web3.
novas atualizações embreve

deletados os aquivos com erros
