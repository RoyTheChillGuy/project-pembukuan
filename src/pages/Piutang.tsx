import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Wallet, AlertTriangle, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { Receivable } from '@/types/finance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Piutang = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [newReceivable, setNewReceivable] = useState({
    customerName: '',
    type: 'piutang',
    totalAmount: '',
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  // Fetch Data
  const { data: receivables = [], isLoading } = useQuery({
    queryKey: ['receivables'],
    queryFn: api.getReceivables,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: api.createReceivable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      setIsDialogOpen(false);
      setNewReceivable({
        customerName: '',
        type: 'piutang',
        totalAmount: '',
      });
      toast.success('Piutang berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan piutang');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteReceivable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      toast.success('Piutang berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus piutang');
    }
  });

  // Add Payment Mutation
  const addPaymentMutation = useMutation({
    mutationFn: ({ id, amount, date }: { id: string; amount: number; date: string }) => 
      api.addReceivablePayment({ id, date, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      setIsPaymentDialogOpen(false);
      setSelectedReceivable(null);
      setPaymentAmount('');
      toast.success('Pembayaran berhasil dicatat');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal mencatat pembayaran');
    }
  });


  const filteredReceivables = receivables.filter((receivable) => {
    const matchesSearch = receivable.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const type = receivable.type || 'piutang';
    const matchesFilter = filterType === 'all' || type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalReceivables = filteredReceivables.reduce((sum, r) => {
    const total = Number(r.totalAmount || 0);
    const paid = Number(r.paidAmount || 0);
    return sum + (total - paid);
  }, 0);

  const activeCount = filteredReceivables.filter((r) => r.status === 'active').length;

  const handleAddReceivable = () => {
    if (!newReceivable.customerName || !newReceivable.totalAmount) {
      toast.error('Mohon lengkapi nama pelanggan dan total piutang');
      return;
    }

    createMutation.mutate({
      id: Date.now().toString(),
      customerName: newReceivable.customerName,
      type: newReceivable.type as any,
      totalAmount: parseFloat(newReceivable.totalAmount),
      paidAmount: 0,
      status: 'active',
      payments: []
    });
  };

  const handleAddPayment = () => {
    if (!selectedReceivable || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast.error('Jumlah pembayaran harus lebih dari 0');
      return;
    }
    
    const total = Number(selectedReceivable.totalAmount || 0);
    const paid = Number(selectedReceivable.paidAmount || 0);
    const remaining = total - paid;
    
    if (amount > remaining) {
      toast.error('Jumlah pembayaran melebihi sisa piutang');
      return;
    }

    addPaymentMutation.mutate({
      id: selectedReceivable.id,
      amount,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data piutang ini?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Piutang"
        subtitle="Kelola cicilan dan piutang pelanggan"
        onAddNew={() => setIsDialogOpen(true)}
        addNewLabel="Tambah Piutang"
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-warning/10 p-6 border border-warning/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-warning/20 p-2">
                <Wallet className="h-5 w-5 text-warning" />
              </div>
              <p className="text-sm font-medium text-warning">Total Piutang Aktif</p>
            </div>
            <p className="text-3xl font-bold text-warning font-tabular">
              {formatRupiah(totalReceivables)}
            </p>
          </div>
          <div className="rounded-xl bg-destructive/10 p-6 border border-destructive/20">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">Piutang Menunggak</p>
            </div>
            <p className="text-3xl font-bold text-destructive font-tabular">{activeCount}</p>
            <p className="text-sm text-muted-foreground">dari {filteredReceivables.length} total</p>
          </div>
          <div className="rounded-xl bg-success/10 p-6 border border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="text-sm font-medium text-success">Sudah Lunas</p>
            </div>
            <p className="text-3xl font-bold text-success font-tabular">
              {filteredReceivables.filter((r) => r.status === 'paid').length}
            </p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="payung_meja">Payung & Meja</SelectItem>
              <SelectItem value="piutang">Piutang</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Receivables Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading data piutang...</div>
        ) : filteredReceivables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card rounded-xl border">Belum ada data piutang</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReceivables.map((receivable, index) => {
              const totalAmount = Number(receivable.totalAmount || 0);
              const paidAmount = Number(receivable.paidAmount || 0);
              const remaining = totalAmount - paidAmount;
              const percentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
              const isOverdue = percentage < 10 && totalAmount > 1000000;
              const customerName = receivable.customerName || 'Tanpa Nama';

              return (
                <div
                  key={receivable.id}
                  className={cn(
                    'rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-card-hover animate-fade-in relative group',
                    receivable.status === 'paid' && 'opacity-60'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(receivable.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-start justify-between mb-4 pr-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center font-semibold',
                          receivable.status === 'paid'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        )}
                      >
                        {customerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{customerName}</h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            receivable.type === 'payung_meja'
                              ? 'bg-info/10 text-info'
                              : 'bg-warning/10 text-warning'
                          )}
                        >
                          {receivable.type === 'payung_meja' ? 'Payung & Meja' : 'Piutang'}
                        </Badge>
                      </div>
                    </div>
                    {isOverdue && <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">{formatRupiah(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Terbayar</span>
                      <span className="font-medium text-success">
                        {formatRupiah(paidAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sisa</span>
                      <span className="font-semibold text-destructive">{formatRupiah(remaining)}</span>
                    </div>

                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {percentage.toFixed(1)}% lunas
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => {
                        setSelectedReceivable(receivable);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      Detail
                    </Button>
                    {receivable.status === 'active' && (
                      <Button
                        size="sm"
                        className="flex-1 gap-1 gradient-primary"
                        onClick={() => {
                          setSelectedReceivable(receivable);
                          setPaymentAmount('');
                          setIsPaymentDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Bayar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Piutang Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Piutang</DialogTitle>
            <DialogDescription>
              Masukkan pelanggan dan jumlah piutang baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customerName">Nama Pelanggan</Label>
              <Input
                id="customerName"
                placeholder="Contoh: Budi"
                value={newReceivable.customerName}
                onChange={(e) => setNewReceivable({ ...newReceivable, customerName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipe</Label>
              <Select
                value={newReceivable.type}
                onValueChange={(value) =>
                  setNewReceivable({ ...newReceivable, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piutang">Piutang</SelectItem>
                  <SelectItem value="payung_meja">Payung & Meja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalAmount">Total Piutang (Rp)</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="0"
                value={newReceivable.totalAmount}
                onChange={(e) => setNewReceivable({ ...newReceivable, totalAmount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleAddReceivable} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Pembayaran</DialogTitle>
            <DialogDescription>
              Catat pembayaran untuk {selectedReceivable?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Sisa Hutang</span>
                <span className="font-semibold text-destructive">
                  {formatRupiah(
                    Number(selectedReceivable?.totalAmount || 0) - 
                    Number(selectedReceivable?.paidAmount || 0)
                  )}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment">Jumlah Pembayaran (Rp)</Label>
              <Input
                id="payment"
                type="number"
                placeholder="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} disabled={addPaymentMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleAddPayment} className="gradient-primary" disabled={addPaymentMutation.isPending}>
              {addPaymentMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Piutang;
