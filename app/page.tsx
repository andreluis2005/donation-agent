export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
        Welcome to Onchain Donation
      </h1>
      <div className="space-y-4 w-full max-w-md">
        <a
          href="/fiat-donation"
          className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold transition duration-300"
        >
          Donate with PIX or Credit Card
        </a>
        <a
          href="/crypto-donation"
          className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-lg font-semibold transition duration-300"
        >
          Donate with Cryptocurrency
        </a>
      </div>
    </div>
  );
}