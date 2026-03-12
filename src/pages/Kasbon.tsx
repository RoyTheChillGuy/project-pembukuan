import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Users, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
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
import { formatRupiah } from '@/lib/formatters';
import { api } from '@/lib/api';
import { Kasbon as KasbonType } from '@/types/finance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Kasbon = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedKasbon, setSelectedKasbon] = useState<KasbonType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newKasbon, setNewKasbon] = useState({
    employeeName: '',
    amount: '',
  });
  const [paymentAmount, setPaymentAmount] = useState('');

  // Fetch data
  const { data: kasbonList = [], isLoading } = useQuery({
    queryKey: ['kasbons'],
    queryFn: api.getKasbons,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: api.createKasbon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasbons'] });
      setIsDialogOpen(false);
      setNewKasbon({ employeeName: '', amount: '' });
      toast.success('Kasbon berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menambahkan kasbon');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: api.deleteKasbon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasbons'] });
      toast.success('Kasbon berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus kasbon');
    }
  });

  // Add Payment Mutation
  const addPaymentMutation = useMutation({
    mutationFn: ({ id, amount, date }: { id: string; amount: number; date: string }) => 
      api.addKasbonPayment({ id, date, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasbons'] });
      setIsPaymentDialogOpen(false);
      setSelectedKasbon(null);
      setPaymentAmount('');
      toast.success('Pembayaran kasbon berhasil dicatat');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal mencatat pembayaran');
    }
  });

  const filteredKasbon = kasbonList.filter((kasbon) =>
    kasbon.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalKasbon = filteredKasbon.reduce((sum, k) => {
    const total = Number(k.amount || 0);
    const remaining = Number(k.remainingAmount || 0);
    return sum + remaining;
  }, 0);
  
  const activeCount = filteredKasbon.filter((k) => k.status === 'active').length;

  const handleAddKasbon = () => {
    if (!newKasbon.employeeName || !newKasbon.amount) {
      toast.error('Mohon lengkapi nama karyawan dan jumlah kasbon');
      return;
    }

    createMutation.mutate({
      id: Date.now().toString(),
      employeeName: newKasbon.employeeName,
      amount: parseFloat(newKasbon.amount),
      remainingAmount: parseFloat(newKasbon.amount),
      paidAmount: 0,
      status: 'active',
      payments: [],
    });
  };

  const handleAddPayment = () => {
    if (!selectedKasbon || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (amount <= 0) {
      toast.error('Jumlah pembayaran harus lebih dari 0');
      return;
    }
    
    const total = Number(selectedKasbon.amount || 0);
    const remaining = Number(selectedKasbon.remainingAmount || 0);
    
    if (amount > remaining) {
      toast.error('Jumlah pembayaran melebihi sisa kasbon');
      return;
    }

    addPaymentMutation.mutate({
      id: selectedKasbon.id,
      amount,
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data kasbon ini?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Kasbon Karyawan"
        subtitle="Kelola kasbon dan pinjaman karyawan"
        onAddNew={() => setIsDialogOpen(true)}
        addNewLabel="Tambah Kasbon"
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-warning/10 p-6 border border-warning/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-warning/20 p-2">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <p className="text-sm font-medium text-warning">Total Kasbon Aktif</p>
            </div>
            <p className="text-3xl font-bold text-warning font-tabular">
              {formatRupiah(totalKasbon)}
            </p>
          </div>
          <div className="rounded-xl bg-destructive/10 p-6 border border-destructive/20">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">Karyawan dengan Kasbon</p>
            </div>
            <p className="text-3xl font-bold text-destructive font-tabular">{activeCount}</p>
          </div>
          <div className="rounded-xl bg-success/10 p-6 border border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <p className="text-sm font-medium text-success">Sudah Lunas</p>
            </div>
            <p className="text-3xl font-bold text-success font-tabular">
              {filteredKasbon.filter((k) => k.status === 'paid').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama karyawan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Kasbon List */}
        {isLoading ? (
          <div className="text-center py-8">Loading data kasbon...</div>
        ) : filteredKasbon.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Belum ada kasbon</h3>
            <p className="text-muted-foreground">Tambahkan kasbon karyawan baru</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredKasbon.map((kasbon, index) => {
              const totalAmount = Number(kasbon.amount || 0);
              const remainingDisplay = Number(kasbon.remainingAmount || 0);
              const paidAmountDisplay = totalAmount - remainingDisplay;
              
              const percentage = totalAmount > 0 ? (paidAmountDisplay / totalAmount) * 100 : 0;
              const employeeName = kasbon.employeeName || 'Tanpa Nama';

              return (
                <div
                  key={kasbon.id}
                  className={cn(
                    'rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-card-hover animate-fade-in relative group',
                    kasbon.status === 'paid' && 'opacity-60'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(kasbon.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg',
                          kasbon.status === 'paid'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        )}
                      >
                        {employeeName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {employeeName}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            kasbon.status === 'active'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          )}
                        >
                          {kasbon.status === 'active' ? 'Aktif' : 'Lunas'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Kasbon</span>
                      <span className="font-medium">{formatRupiah(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Terbayar</span>
                      <span className="font-medium text-success">{formatRupiah(paidAmountDisplay)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sisa</span>
                      <span className="font-semibold text-destructive">
                        {formatRupiah(remainingDisplay)}
                      </span>
                    </div>

                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {percentage.toFixed(1)}% terbayar
                    </p>
                  </div>

                  {kasbon.status === 'active' && (
                    <Button 
                      className="w-full mt-4 gap-1 gradient-primary" 
                      size="sm"
                      onClick={() => {
                        setSelectedKasbon(kasbon);
                        setPaymentAmount('');
                        setIsPaymentDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      Catat Pembayaran
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Kasbon</DialogTitle>
            <DialogDescription>Catat kasbon karyawan baru.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Nama Karyawan</Label>
              <Input
                id="employee"
                placeholder="Contoh: Ikhsan"
                value={newKasbon.employeeName}
                onChange={(e) => setNewKasbon({ ...newKasbon, employeeName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Jumlah Kasbon (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={newKasbon.amount}
                onChange={(e) => setNewKasbon({ ...newKasbon, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={createMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleAddKasbon} className="gradient-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Catat Pembayaran Kasbon</DialogTitle>
            <DialogDescription>
              Catat pembayaran untuk {selectedKasbon?.employeeName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Sisa Kasbon</span>
                <span className="font-semibold text-destructive">
                  {formatRupiah(
                    (() => {
                      if (!selectedKasbon) return 0;
                      return Number(selectedKasbon.remainingAmount || 0);
                    })()
                  )}
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_kasbon">Jumlah Pembayaran (Rp)</Label>
              <Input
                id="payment_kasbon"
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

export default Kasbon;
