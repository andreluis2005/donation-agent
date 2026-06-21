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
			"dad3dec46ff741e3cb3d0c0180be4a38a5909b1f583f96e6806cd6dd189ebf196848fb795ae3411f0d89a94232a3a9cac6823ddf4675ba05c3aea4eaf226e40c",
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
