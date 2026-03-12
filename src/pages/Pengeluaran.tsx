import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Filter, Download, Search, MoreHorizontal, Edit2, Trash2, PieChart } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRupiah, formatDate } from '@/lib/formatters';
import { api } from '@/lib/api';
import { Expense, ExpenseCategory } from '@/types/finance';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { exportToExcel } from '@/lib/exportUtils';
const categoryLabels: Record<ExpenseCategory, string> = {
  gas_tabung: 'Gas Tabung',
  makan_siang: 'Makan Siang',
  operasional: 'Operasional',
  transport: 'Transport',
  kasbon: 'Kasbon',
  ongkir: 'Ongkir',
  perlengkapan: 'Perlengkapan',
  lainnya: 'Lainnya',
};

const categoryColors: Record<ExpenseCategory, string> = {
  gas_tabung: 'hsl(210, 80%, 55%)',
  makan_siang: 'hsl(145, 60%, 45%)',
  operasional: 'hsl(40, 85%, 55%)',
  transport: 'hsl(280, 60%, 55%)',
  kasbon: 'hsl(0, 75%, 55%)',
  ongkir: 'hsl(180, 60%, 45%)',
  perlengkapan: 'hsl(320, 60%, 55%)',
  lainnya: 'hsl(0, 0%, 50%)',
};

const Pengeluaran = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'operasional' as ExpenseCategory,
    amount: '',
  });

  // Fetch data
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: api.getExpenses,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: api.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsDialogOpen(false);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'operasional',
        amount: '',
      });
      toast.success('Pengeluaran berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan data');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Pengeluaran berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus data');
    }
  });

  const filteredExpenses = expenses.filter((expense) =>
    expense.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // Calculate category totals for pie chart
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals).map(([category, value]) => ({
    name: categoryLabels[category as ExpenseCategory] || category,
    value,
    color: categoryColors[category as ExpenseCategory] || categoryColors.lainnya,
  }));

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) {
      toast.error('Mohon lengkapi semua data mandatory');
      return;
    }

    createMutation.mutate({
      id: Date.now().toString(),
      date: newExpense.date,
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    if (filteredExpenses.length === 0) {
      toast.error('Tidak ada data untuk di-export');
      return;
    }

    const dataToExport = filteredExpenses.map((expense) => ({
      'Tanggal': formatDate(expense.date),
      'Deskripsi': expense.description,
      'Kategori': categoryLabels[expense.category as ExpenseCategory] || expense.category,
      'Jumlah (Rp)': Number(expense.amount)
    }));

    exportToExcel(dataToExport, `Laporan_Pengeluaran_${new Date().toISOString().split('T')[0]}`, 'Pengeluaran');
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Pengeluaran"
        subtitle="Kelola semua biaya operasional"
        onAddNew={() => setIsDialogOpen(true)}
        addNewLabel="Tambah Pengeluaran"
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Summary and Chart */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-destructive/10 p-6 border border-destructive/20">
            <p className="text-sm font-medium text-destructive">Total Pengeluaran</p>
            <p className="text-3xl font-bold text-destructive font-tabular mt-2">
              {formatRupiah(totalExpense)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{filteredExpenses.length} transaksi</p>
          </div>

          <div className="lg:col-span-2 rounded-xl bg-card p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Distribusi Pengeluaran</h3>
            </div>
            <div className="h-[200px]">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatRupiah(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Belum ada data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pengeluaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading data...</TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada data pengeluaran</TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense, index) => (
                  <TableRow
                    key={expense.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">{formatDate(expense.date)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: `${categoryColors[expense.category as ExpenseCategory] || categoryColors.lainnya}20`,
                          color: categoryColors[expense.category as ExpenseCategory] || categoryColors.lainnya,
                        }}
                      >
                        {categoryLabels[expense.category as ExpenseCategory] || expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-destructive font-tabular">
                      -{formatRupiah(Number(expense.amount))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 text-destructive"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Pengeluaran</DialogTitle>
            <DialogDescription>
              Masukkan data pengeluaran baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                placeholder="Contoh: Gas Tabung"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value: ExpenseCategory) =>
                  setNewExpense({ ...newExpense, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleAddExpense} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pengeluaran;

