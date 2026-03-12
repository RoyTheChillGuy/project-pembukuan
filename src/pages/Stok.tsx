import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Minus, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StokItem {
  id: string;
  name: string;
  mentah: number;
  terpakai: number;
  baru: number;
  total: number;
}

const Stok = () => {
  const queryClient = useQueryClient();
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StokItem | null>(null);
  const [updateForm, setUpdateForm] = useState({
    mentah: '',
    terpakai: '',
    baru: '',
  });

  // Fetch data
  const { data: stockData = [], isLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: api.getStocks,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; mentah: number; terpakai: number; baru: number; total: number }) => 
      api.updateStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setIsUpdateDialogOpen(false);
      setSelectedStock(null);
      toast.success('Stok berhasil diupdate');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal update stok');
    }
  });

  const maxStock = stockData.length > 0 ? Math.max(...stockData.map((s: any) => Number(s.total) || 0)) : 0;
  
  const totalStok = stockData.reduce((sum: number, s: any) => sum + (Number(s.total) || 0), 0);
  const totalMentah = stockData.reduce((sum: number, s: any) => sum + (Number(s.mentah) || 0), 0);
  const totalBaru = stockData.reduce((sum: number, s: any) => sum + (Number(s.baru) || 0), 0);
  const totalTerpakai = stockData.reduce((sum: number, s: any) => sum + (Number(s.terpakai) || 0), 0);

  const handleOpenUpdate = (item: any) => {
    setSelectedStock(item);
    setUpdateForm({
      mentah: item.mentah?.toString() || '0',
      terpakai: item.terpakai?.toString() || '0',
      baru: item.baru?.toString() || '0',
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (!selectedStock) return;
    
    const mentah = Number(updateForm.mentah) || 0;
    const terpakai = Number(updateForm.terpakai) || 0;
    const baru = Number(updateForm.baru) || 0;
    const total = mentah + baru; // Adjust calculation if total has a specific formula

    updateMutation.mutate({
      id: selectedStock.id,
      mentah,
      terpakai,
      baru,
      total
    });
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Manajemen Stok"
        subtitle="Kelola stok mentah, terpakai, dan baru"
        onAddNew={() => {}}
        addNewLabel="Refresh Data"
        hideAddButton={true}
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-primary/10 p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-primary/20 p-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-primary">Total Stok</p>
            </div>
            <p className="text-3xl font-bold text-primary font-tabular">{totalStok} karung</p>
          </div>
          <div className="rounded-xl bg-warning/10 p-6 border border-warning/20">
            <div className="flex items-center gap-3 mb-2">
              <Minus className="h-5 w-5 text-warning" />
              <p className="text-sm font-medium text-warning">Stok Mentah</p>
            </div>
            <p className="text-3xl font-bold text-warning font-tabular">{totalMentah} karung</p>
          </div>
          <div className="rounded-xl bg-success/10 p-6 border border-success/20">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="h-5 w-5 text-success" />
              <p className="text-sm font-medium text-success">Stok Baru</p>
            </div>
            <p className="text-3xl font-bold text-success font-tabular">{totalBaru} karung</p>
          </div>
        </div>

        {/* Stock Flow Diagram */}
        <div className="rounded-xl bg-card p-6 shadow-card border">
          <h3 className="font-semibold text-foreground mb-4">Alur Stok Keseluruhan</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="rounded-lg bg-warning/10 p-4 text-center min-w-[120px]">
              <p className="text-sm text-muted-foreground">Stok Mentah</p>
              <p className="text-2xl font-bold text-warning">{totalMentah}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="rounded-lg bg-info/10 p-4 text-center min-w-[120px]">
              <p className="text-sm text-muted-foreground">Diproses / Terpakai</p>
              <p className="text-2xl font-bold text-info">{totalTerpakai}</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="rounded-lg bg-success/10 p-4 text-center min-w-[120px]">
              <p className="text-sm text-muted-foreground">Stok Baru</p>
              <p className="text-2xl font-bold text-success">{totalBaru}</p>
            </div>
          </div>
        </div>

        {/* Stock List */}
        <div className="rounded-xl bg-card shadow-card border overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h3 className="font-semibold text-foreground">Daftar Stok per Jenis</h3>
          </div>
          <div className="divide-y">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading data stok...</div>
            ) : stockData.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Belum ada data stok.</div>
            ) : (
              stockData.map((item: any, index: number) => {
                const mentah = Number(item.mentah) || 0;
                const terpakai = Number(item.terpakai) || 0;
                const baru = Number(item.baru) || 0;
                const total = Number(item.total) || 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {total} karung
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={maxStock > 0 ? (total / maxStock) * 100 : 0} className="flex-1 h-2" />
                        <div className="flex gap-3 text-xs">
                          <span className="text-warning">M: {mentah}</span>
                          <span className="text-info">T: {terpakai}</span>
                          <span className="text-success">B: {baru}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenUpdate(item)}
                    >
                      Update
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">M = Mentah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-info" />
            <span className="text-muted-foreground">T = Terpakai</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-muted-foreground">B = Baru</span>
          </div>
        </div>
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Stok: {selectedStock?.name}</DialogTitle>
            <DialogDescription>
              Perbarui jumlah stok mentah, terpakai, dan baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mentah">Mentah (M)</Label>
              <Input
                id="mentah"
                type="number"
                placeholder="0"
                value={updateForm.mentah}
                onChange={(e) => setUpdateForm({ ...updateForm, mentah: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="terpakai">Terpakai / Diproses (T)</Label>
              <Input
                id="terpakai"
                type="number"
                placeholder="0"
                value={updateForm.terpakai}
                onChange={(e) => setUpdateForm({ ...updateForm, terpakai: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="baru">Baru (B)</Label>
              <Input
                id="baru"
                type="number"
                placeholder="0"
                value={updateForm.baru}
                onChange={(e) => setUpdateForm({ ...updateForm, baru: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)} disabled={updateMutation.isPending}>
              Batal
            </Button>
            <Button onClick={handleUpdateSubmit} className="gradient-primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stok;
