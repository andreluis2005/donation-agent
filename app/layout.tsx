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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ClientProviders>{children}</ClientProviders>
			</body>
		</html>
	);
}
