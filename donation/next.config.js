/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true, // Ativa o modo estrito do React para melhores práticas
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.externals = config.externals || [];
			config.externals.push("fs"); // Exclui o módulo 'fs' no lado do cliente
		}
		return config;
	},
	env: {
		// Variáveis de ambiente públicas (acessíveis no cliente e servidor)
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_CDP_API_KEY: process.env.NEXT_PUBLIC_CDP_API_KEY,
		DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
	},
	images: {
		// Domínios permitidos para o componente <Image> do Next.js
		domains: [
			"localhost", // Para desenvolvimento local
			"donation-agent.vercel.app", // Se você usa Vercel
			// Adicione outros domínios se usar imagens externas (ex.: CDN do Supabase)
		],
	},
	// Opcional: Configurações para otimizar o build e deploy
	experimental: {
		optimizePackageImports: ["@supabase/ssr", "@supabase/supabase-js"], // Melhora a importação de pacotes grandes
	},
};

module.exports = nextConfig;
