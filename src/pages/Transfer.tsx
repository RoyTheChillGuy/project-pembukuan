import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MoreHorizontal, Edit2, Trash2, Download, CreditCard } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { formatRupiah, formatDate } from '@/lib/formatters';
import { api } from '@/lib/api';
import { Transfer as TransferType } from '@/types/finance';
import { toast } from 'sonner';
import { exportToExcel } from '@/lib/exportUtils';
const Transfer = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTransfer, setNewTransfer] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    amount: '',
  });

  // Fetch data
  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: api.getTransfers,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: api.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      setIsDialogOpen(false);
      setNewTransfer({
        date: new Date().toISOString().split('T')[0],
        name: '',
        amount: '',
      });
      toast.success('Data transfer berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan data transfer');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success('Data transfer berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus data transfer');
    }
  });

  const filteredTransfers = transfers.filter((transfer) =>
    transfer.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTransfer = filteredTransfers.reduce((sum, tr) => sum + Number(tr.amount), 0);

  const handleAddTransfer = () => {
    if (!newTransfer.name || !newTransfer.amount) {
      toast.error('Mohon lengkapi semua data mandatory');
      return;
    }

    createMutation.mutate({
      id: Date.now().toString(),
      date: newTransfer.date,
      name: newTransfer.name,
      amount: parseFloat(newTransfer.amount),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = () => {
    if (filteredTransfers.length === 0) {
      toast.error('Tidak ada data untuk di-export');
      return;
    }

    const dataToExport = filteredTransfers.map((transfer) => ({
      'Tanggal': formatDate(transfer.date),
      'Nama': transfer.name,
      'Jumlah (Rp)': Number(transfer.amount)
    }));

    exportToExcel(dataToExport, `Laporan_Transfer_${new Date().toISOString().split('T')[0]}`, 'Transfer');
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Transfer"
        subtitle="Kelola setoran via transfer"
        onAddNew={() => setIsDialogOpen(true)}
        addNewLabel="Tambah Transfer"
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-info/10 p-6 border border-info/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-info/20 p-2">
                <CreditCard className="h-5 w-5 text-info" />
              </div>
              <p className="text-sm font-medium text-info">Total Transfer Masuk</p>
            </div>
            <p className="text-3xl font-bold text-info font-tabular">
              {formatRupiah(totalTransfer)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{filteredTransfers.length} transaksi</p>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-card border">
            <p className="text-sm font-medium text-muted-foreground">Rata-rata Transfer</p>
            <p className="text-2xl font-bold text-foreground font-tabular mt-2">
              {formatRupiah(filteredTransfers.length > 0 ? totalTransfer / filteredTransfers.length : 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">per transaksi</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
               <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">Loading data...</TableCell>
               </TableRow>
              ) : filteredTransfers.length === 0 ? (
               <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada data transfer</TableCell>
               </TableRow>
              ) : (
                filteredTransfers.map((transfer, index) => (
                  <TableRow
                    key={transfer.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell className="font-medium">{formatDate(transfer.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-info">
                            {(transfer.name || '?').charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{transfer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-info font-tabular">
                      +{formatRupiah(Number(transfer.amount))}
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
                            onClick={() => handleDelete(transfer.id)}
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
            <DialogTitle>Tambah Transfer</DialogTitle>
            <DialogDescription>
              Masukkan data transfer masuk baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={newTransfer.date}
                onChange={(e) => setNewTransfer({ ...newTransfer, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                placeholder="Contoh: Mas Ikhwanan"
                value={newTransfer.name}
                onChange={(e) => setNewTransfer({ ...newTransfer, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={newTransfer.amount}
                onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleAddTransfer} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transfer;

