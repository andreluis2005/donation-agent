"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers"; // Adicione ethers como dependência no package.json
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function FiatDonation() {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [message, setMessage] = useState<JSX.Element | string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Gerar carteira automática ao carregar a página
  useEffect(() => {
    const generateWallet = async () => {
      const wallet = ethers.Wallet.createRandom();
      setWalletAddress(wallet.address);
      // Simulação: salvar a carteira privada em localStorage (para demo, use um backend seguro em produção)
      localStorage.setItem("privateKey", wallet.privateKey);
      setMessage(
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-100 text-emerald-700">
          <FaCheckCircle /> Wallet generated: {wallet.address.slice(0, 6)}...
        </div>
      );
    };
    generateWallet();
  }, []);

  // Função para carregar saldo via PIX (simulação)
  const handleLoadBalance = async () => {
    setIsLoading(true);
    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setMessage(
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 text-red-700">
            <FaExclamationCircle /> Invalid amount.
          </div>
        );
        setIsLoading(false);
        return;
      }
      // Simulação: converte BRL para cripto (integre API real em produção)
      const conversionRate = 0.00025; // Exemplo: 1 BRL = 0.00025 ETH
      const cryptoAmount = amountValue * conversionRate;
      setBalance((prev) => prev + cryptoAmount);
      setMessage(
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-100 text-emerald-700">
          <FaCheckCircle /> Loaded {amount} BRL (~{cryptoAmount.toFixed(6)} ETH).
        </div>
      );
      setAmount("");
    } catch (error) {
      setMessage(
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 text-red-700">
          <FaExclamationCircle /> Error loading balance.
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Função para doar (usando saldo interno)
  const handleDonate = async (toAddress: string) => {
    if (balance <= 0) {
      setMessage(
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 text-red-700">
          <FaExclamationCircle /> Insufficient balance.
        </div>
      );
      return;
    }
    // Simulação: subtrai do saldo e registra doação
    setBalance((prev) => prev - 0.001); // Exemplo: doa 0.001 ETH
    setMessage(
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-100 text-emerald-700">
        <FaCheckCircle /> Donated 0.001 ETH to {toAddress.slice(0, 6)}...
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Fiat Donation</h1>
      {walletAddress && (
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </p>
      )}
      <div className="w-full max-w-md space-y-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in BRL"
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleLoadBalance}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400"
        >
          {isLoading ? "Loading..." : "Load with PIX/Card"}
        </button>
        <p className="text-center text-gray-600 dark:text-gray-300">Balance: {balance.toFixed(6)} ETH</p>
        <button
          onClick={() => handleDonate("0xCaE3E92B39a1965A4B98bE34470Fdc1f49279e6")} // Exemplo: Education
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
        >
          Donate to Education
        </button>
      </div>
      {message && <div className="mt-4">{message}</div>}
    </div>
  );
}