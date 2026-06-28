//app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Onchain Donation Agent",
	description:
		"An autonomous agent for onchain donations using the Coinbase Developer Platform AgentKit.",
	other: {
		"talentapp:project_verification":
			"988ae5a22a6898aa345bdb8fe22bec66f34af8f750ce015a52cb47613d0f1498691ad599f0ddd111b4208aac13e6826551e780e5ae095bfbe777d0301b90db24",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR">
			<body className={inter.className}>
				<ClientProviders>{children}</ClientProviders>
			</body>
		</html>
	);
}
