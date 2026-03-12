import { Bell, Search, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  hideAddButton?: boolean;
}

export const Header = ({ title, subtitle, onAddNew, addNewLabel = 'Tambah Baru', hideAddButton = false }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
            <SheetHeader className="h-16 flex flex-row items-center px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-gold flex items-center justify-center">
                  <span className="text-sm font-bold text-sidebar-primary-foreground">KN</span>
                </div>
                <SheetTitle className="text-lg font-bold text-sidebar-foreground">Kito Nian</SheetTitle>
              </div>
            </SheetHeader>
            <div className="py-2">
              <SidebarContent onItemClick={() => setIsOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            className="w-64 pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        {/* Add New Button */}
        {onAddNew && !hideAddButton && (
          <Button onClick={onAddNew} size="sm" className="gap-2 gradient-primary text-primary-foreground border-0 shadow-md hover:shadow-lg transition-all h-9 md:h-10 px-3 md:px-4">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{addNewLabel}</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        )}
      </div>
    </header>
  );
};
