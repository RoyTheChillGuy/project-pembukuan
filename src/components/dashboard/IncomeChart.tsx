import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiahShort, formatDate } from "@/lib/formatters";
import { api } from "@/lib/api";

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-card p-3 shadow-lg border border-border">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name === "pemasukan" ? "Pemasukan" : "Pengeluaran"}:{" "}
            <span className="font-semibold">
              {formatRupiahShort(entry.value)}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const IncomeChart = () => {
  const { data: incomes = [], isLoading: loadingIncomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: api.getIncomes,
  });

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: api.getExpenses,
  });

  // Process data for the chart (Group by Date)
  const chartDataMap = new Map();

  // Process Incomes
  incomes.forEach((income: any) => {
    const date = formatDate(income.date);
    if (!chartDataMap.has(date)) {
      chartDataMap.set(date, { name: date, pemasukan: 0, pengeluaran: 0 });
    }
    chartDataMap.get(date).pemasukan += Number(income.amount || 0);
  });

  // Process Expenses
  expenses.forEach((expense: any) => {
    const date = formatDate(expense.date);
    if (!chartDataMap.has(date)) {
      chartDataMap.set(date, { name: date, pemasukan: 0, pengeluaran: 0 });
    }
    chartDataMap.get(date).pengeluaran += Number(expense.amount || 0);
  });

  // Convert map to sorted array
  const sortedData = Array.from(chartDataMap.values()).sort((a, b) => {
      // Assuming 'name' is formulated nicely by formatDate, string compare might suffice, 
      // but proper Date parsing is safer.
      return new Date(a.name).getTime() - new Date(b.name).getTime();
  });


  return (
    <div className="rounded-xl bg-card p-6 shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Grafik Keuangan
        </h3>
        <p className="text-sm text-muted-foreground">
          Pemasukan vs Pengeluaran
        </p>
      </div>

      <div className="h-[300px]">
        {loadingIncomes || loadingExpenses ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : sortedData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
             Belum ada data pemasukan atau pengeluaran
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sortedData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(145, 60%, 45%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(145, 60%, 45%)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(0, 75%, 55%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(0, 75%, 55%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => formatRupiahShort(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="pemasukan"
                stroke="hsl(145, 60%, 45%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPemasukan)"
              />
              <Area
                type="monotone"
                dataKey="pengeluaran"
                stroke="hsl(0, 75%, 55%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPengeluaran)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Pemasukan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-sm text-muted-foreground">Pengeluaran</span>
        </div>
      </div>
    </div>
  );
};
