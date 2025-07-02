type Props = {
  balance: number;
  currency: string;
};

export default function BalanceCard({ balance, currency }: Props) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg w-full max-w-md mx-auto">
      <p className="text-sm opacity-80">Saldo Anda</p>
      <p className="text-4xl font-bold mt-2">
        {currency}{' '}
        {balance.toLocaleString('id-ID', { minimumFractionDigits: 0 })}
      </p>
    </div>
  );
}