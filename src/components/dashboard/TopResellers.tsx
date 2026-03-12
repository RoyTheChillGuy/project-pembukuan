import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Medal } from 'lucide-react';
import { formatRupiah, formatKG } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const getRankBadge = (rank: number) => {
  const badges = {
    1: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900',
    2: 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900',
    3: 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100',
  };
  return badges[rank as keyof typeof badges] || 'bg-muted text-muted-foreground';
};

export const TopResellers = () => {
  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: api.getIncomes,
  });

  // Calculate top resellers dynamically based on actual database data
  const resellerMap = new Map();

  incomes.forEach((income: any) => {
    // Basic assumption: If category='Penjualan' or has a valid source_name
    const name = income.sourceName || income.source_name || 'Pembeli Anonim';
    const amount = Number(income.amount || 0);
    // Rough estimation of KG if we don't have explicit product weight stored. 
    // Usually, you should fetch this from a specific column if it exists.
    // For now, let's just show standard currency and total transaction counts as proxy to 'weight/amount'
    
    if (!resellerMap.has(name)) {
      resellerMap.set(name, { name, totalAmount: 0, trxCount: 0 });
    }
    
    resellerMap.get(name).totalAmount += amount;
    resellerMap.get(name).trxCount += 1;
  });

  const sortedResellers = Array.from(resellerMap.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));

  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Sumber Pemasukan</h3>
          <p className="text-sm text-muted-foreground">Berdasarkan total nominal bulan ini</p>
        </div>
        <div className="rounded-lg bg-accent/10 p-2">
          <Medal className="h-5 w-5 text-accent" />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : sortedResellers.length === 0 ? (
           <div className="text-center py-4 text-muted-foreground">Belum ada data</div>
        ) : sortedResellers.map((reseller, index) => (
          <div
            key={reseller.rank}
            className="group flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-secondary/50"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm',
                getRankBadge(reseller.rank)
              )}
            >
              {reseller.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{reseller.name}</p>
              <p className="text-sm text-muted-foreground">{reseller.trxCount} Transaksi</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground font-tabular">
                {formatRupiah(reseller.totalAmount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
