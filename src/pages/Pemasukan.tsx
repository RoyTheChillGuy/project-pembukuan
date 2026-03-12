import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, Download, Search, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
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
import { formatRupiah, formatDate, formatKG } from '@/lib/formatters';
import { api } from '@/lib/api';
import { Income } from '@/types/finance';
import { toast } from 'sonner';
import { exportToExcel } from './../lib/exportUtils';

const Pemasukan = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    resellerName: '',
    kg: '',
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'transfer',
  });

  // Fetch data
  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: api.getIncomes,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: api.createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setIsDialogOpen(false);
      setNewIncome({
        date: new Date().toISOString().split('T')[0],
        resellerName: '',
        kg: '',
        amount: '',
        paymentMethod: 'cash',
      });
      toast.success('Transaksi pemasukan berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan data');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success('Transaksi pemasukan berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus data');
    }
  });

  const filteredIncomes = incomes.filter((income) =>
    income.reseller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    income.resellerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalKg = filteredIncomes.reduce((sum, inc) => sum + Number(inc.kg), 0);

  const handleAddIncome = () => {
    if (!newIncome.resellerName || !newIncome.kg || !newIncome.amount) {
      toast.error('Mohon lengkapi semua data mandatory');
      return;
    }

    createMutation.mutate({
      id: Date.now().toString(),
      date: newIncome.date,
      resellerName: newIncome.resellerName,
      kg: parseFloat(newIncome.kg),
      amount: parseFloat(newIncome.amount),
      paymentMethod: newIncome.paymentMethod,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    if (filteredIncomes.length === 0) {
      toast.error('Tidak ada data untuk di-export');
      return;
    }

    const dataToExport = filteredIncomes.map((income) => ({
      'Tanggal': formatDate(income.date),
      'Nama Reseller': income.resellerName || income.reseller_name,
      'KG': Number(income.kg),
      'Jumlah (Rp)': Number(income.amount),
      'Metode': (income.paymentMethod || income.payment_method) === 'cash' ? 'Cash' : 'Transfer',
      'Catatan': income.notes || '-'
    }));

    exportToExcel(dataToExport, `Laporan_Pemasukan_${new Date().toISOString().split('T')[0]}`, 'Pemasukan');
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Pemasukan"
        subtitle="Kelola semua transaksi pemasukan"
        onAddNew={() => setIsDialogOpen(true)}
        addNewLabel="Tambah Pemasukan"
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-success/10 p-4 border border-success/20">
            <p className="text-sm font-medium text-success">Total Pemasukan</p>
            <p className="text-2xl font-bold text-success font-tabular">{formatRupiah(totalIncome)}</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-4 border border-primary/20">
            <p className="text-sm font-medium text-primary">Total KG</p>
            <p className="text-2xl font-bold text-primary font-tabular">{formatKG(totalKg)}</p>
          </div>
          <div className="rounded-xl bg-info/10 p-4 border border-info/20">
            <p className="text-sm font-medium text-info">Total Transaksi</p>
            <p className="text-2xl font-bold text-info font-tabular">{filteredIncomes.length}</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama reseller..."
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
                <TableHead>Nama Reseller</TableHead>
                <TableHead className="text-right">KG</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading data...</TableCell>
                </TableRow>
              ) : filteredIncomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada data pemasukan</TableCell>
                </TableRow>
              ) : (
                filteredIncomes.map((income, index) => (
                  <TableRow
                    key={income.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">{formatDate(income.date)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{income.resellerName || income.reseller_name}</div>
                      {income.notes && (
                        <div className="text-sm text-muted-foreground">{income.notes}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-tabular">{formatKG(Number(income.kg))}</TableCell>
                    <TableCell className="text-right font-semibold text-success font-tabular">
                      {formatRupiah(Number(income.amount))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={(income.paymentMethod || income.payment_method) === 'cash' ? 'default' : 'secondary'}
                        className={
                          (income.paymentMethod || income.payment_method) === 'cash'
                            ? 'bg-success/10 text-success hover:bg-success/20'
                            : 'bg-info/10 text-info hover:bg-info/20'
                        }
                      >
                        {(income.paymentMethod || income.payment_method) === 'cash' ? 'Cash' : 'Transfer'}
                      </Badge>
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
                            onClick={() => handleDelete(income.id)}
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
            <DialogTitle>Tambah Pemasukan</DialogTitle>
            <DialogDescription>
              Masukkan data transaksi pemasukan baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={newIncome.date}
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reseller">Nama Reseller</Label>
              <Input
                id="reseller"
                placeholder="Contoh: Pak Arif"
                value={newIncome.resellerName}
                onChange={(e) => setNewIncome({ ...newIncome, resellerName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="kg">Jumlah (KG)</Label>
                <Input
                  id="kg"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={newIncome.kg}
                  onChange={(e) => setNewIncome({ ...newIncome, kg: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Metode Pembayaran</Label>
              <Select
                value={newIncome.paymentMethod}
                onValueChange={(value: 'cash' | 'transfer') =>
                  setNewIncome({ ...newIncome, paymentMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleAddIncome} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pemasukan;

