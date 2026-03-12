import { useQuery } from '@tanstack/react-query';
import { Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export const ReceivablesSummary = () => {
  const { data: receivables = [], isLoading } = useQuery({
    queryKey: ['receivables'],
    queryFn: api.getReceivables,
  });

  const totalReceivables = receivables.reduce((sum: number, r: any) => {
      const total = Number(r.totalAmount || r.total_amount || 0);
      const paid = Number(r.paidAmount || r.paid_amount || 0);
      return sum + (total - paid);
  }, 0);

  // Take top 5 active receivables with biggest remaining amounts
  const topReceivables = receivables
    .filter((r: any) => r.status !== 'paid')
    .sort((a: any, b: any) => {
      const remainingA = Number(a.totalAmount || a.total_amount || 0) - Number(a.paidAmount || a.paid_amount || 0);
      const remainingB = Number(b.totalAmount || b.total_amount || 0) - Number(b.paidAmount || b.paid_amount || 0);
      return remainingB - remainingA;
    })
    .slice(0, 5);


  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Piutang Aktif</h3>
          <p className="text-sm text-muted-foreground">Total Keseluruhan: {formatRupiah(totalReceivables)}</p>
        </div>
        <div className="rounded-lg bg-warning/10 p-2">
          <Wallet className="h-5 w-5 text-warning" />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : topReceivables.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">Tidak ada piutang aktif</div>
        ) : topReceivables.map((item: any, index: number) => {
          const total = Number(item.totalAmount || item.total_amount || 0);
          const paid = Number(item.paidAmount || item.paid_amount || 0);
          const remaining = total - paid;
          const percentage = total > 0 ? (paid / total) * 100 : 0;
          const isOverdue = percentage < 10 && total > 1000000;
          
          const name = item.customerName || item.customer_name || 'Anonim';
          const type = item.type || 'piutang';

          return (
            <div
              key={item.id}
              className="rounded-lg border border-border p-4 transition-all hover:border-primary/30 hover:shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{name}</span>
                  {isOverdue && (
                    <AlertTriangle className="h-4 w-4 text-warning animate-pulse" />
                  )}
                  {percentage >= 90 && (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    type === 'payung_meja'
                      ? 'bg-info/10 text-info'
                      : 'bg-warning/10 text-warning'
                  )}
                >
                  {type === 'payung_meja' ? 'Payung & Meja' : 'Piutang'}
                </span>
              </div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Terbayar: {formatRupiah(paid)}
                </span>
                <span className="font-medium text-destructive">
                  Sisa: {formatRupiah(remaining)}
                </span>
              </div>
              <Progress
                value={percentage}
                className="h-2"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {percentage.toFixed(1)}% lunas
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
