import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, CreditCard, Wallet, Users, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { IncomeChart } from '@/components/dashboard/IncomeChart';
import { TopResellers } from '@/components/dashboard/TopResellers';
import { ReceivablesSummary } from '@/components/dashboard/ReceivablesSummary';
import { api } from '@/lib/api';

const Dashboard = () => {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: api.getDashboardSummary,
  });

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        subtitle="Februari 2025 - Kito Nian"
      />

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">
          Loading dashboard metrics...
        </div>
      ) : error || !summary ? (
        <div className="p-12 text-center text-destructive">
          Gagal memuat data dashboard.
        </div>
      ) : (
        <div className="p-4 md:p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Pemasukan"
              value={summary.totalIncome || 0}
              change={summary.incomeChange || 0}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Total Pengeluaran"
              value={summary.totalExpense || 0}
              change={summary.expenseChange || 0}
              icon={TrendingDown}
              variant="danger"
            />
            <StatCard
              title="Total Transfer"
              value={summary.totalTransfer || 0}
              icon={CreditCard}
              variant="info"
            />
            <StatCard
              title="Total Piutang"
              value={summary.totalReceivables || 0}
              icon={Wallet}
              variant="warning"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Kas (Cash)"
              value={summary.totalCash || 0}
              icon={Wallet}
              variant="success"
            />
            <StatCard
              title="Total Kasbon Karyawan"
              value={summary.totalKasbon || 0}
              icon={Users}
              variant="warning"
            />
            <StatCard
              title="Laba Bersih"
              value={summary.netProfit || 0}
              icon={TrendingUp}
              variant="success"
            />
          </div>

          {/* Charts and Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            <IncomeChart />
            <TopResellers />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentTransactions />
            <ReceivablesSummary />
          </div>

          {/* Alert for pending receivables */}
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Perhatian Piutang</p>
              <p className="text-sm text-muted-foreground">
                Ada piutang dengan cicilan tertunda lebih dari 30 hari. Silakan tinjau bagian Piutang untuk detail lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
