import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRupiah, formatDate } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export const RecentTransactions = () => {
  const { data: incomes = [], isLoading: loadingIncomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: api.getIncomes,
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: api.getExpenses,
  });

  // Merge and sort
  const allTransactions = [
    ...incomes.map((inc: any) => ({
      id: `inc_${inc.id}`,
      type: 'income',
      description: inc.sourceName || inc.source_name || 'Pemasukan',
      amount: Number(inc.amount),
      date: inc.date,
      category: inc.category || 'General',
    })),
    ...expenses.map((exp: any) => ({
      id: `exp_${exp.id}`,
      type: 'expense',
      description: exp.description || 'Pengeluaran',
      amount: Number(exp.amount),
      date: exp.date,
      category: exp.category || 'Operasional',
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .slice(0, 7); // Only top 7 recent


  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Transaksi Terbaru</h3>
          <p className="text-sm text-muted-foreground">7 transaksi terakhir</p>
        </div>
      </div>

      <div className="space-y-3">
        {loadingIncomes || loadingExpenses ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : allTransactions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Belum ada transaksi</div>
        ) : allTransactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-secondary/50"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  transaction.type === 'income'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                )}
              >
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p
                className={cn(
                  'font-semibold font-tabular',
                  transaction.type === 'income' ? 'text-success' : 'text-destructive'
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatRupiah(transaction.amount)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
