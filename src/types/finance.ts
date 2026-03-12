// Income (Pemasukan)
export interface Income {
  id: string;
  date: string;
  resellerName: string;
  kg: number;
  amount: number;
  payungMeja?: number; // P&M
  piutangLunas?: number; // PL
  uang?: number; // U
  paymentMethod: 'cash' | 'transfer';
  notes?: string;
}

// Expense (Pengeluaran)
export interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  notes?: string;
}

export type ExpenseCategory = 
  | 'gas_tabung'
  | 'makan_siang'
  | 'operasional'
  | 'transport'
  | 'kasbon'
  | 'ongkir'
  | 'perlengkapan'
  | 'lainnya';

// Receivable / Piutang
export interface Receivable {
  id: string;
  customerName: string;
  type: 'payung_meja' | 'piutang';
  totalAmount: number;
  paidAmount: number;
  status: 'active' | 'paid';
  payments: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

// Kasbon (Employee advance)
export interface Kasbon {
  id: string;
  employeeName: string;
  amount: number;
  remainingAmount: number;
  status: 'active' | 'paid';
  payments: Payment[];
  createdAt: string;
}

// Transfer (Transfer deposit)
export interface Transfer {
  id: string;
  date: string;
  name: string;
  amount: number;
  payungMeja?: number;
  piutangLunas?: number;
  uang?: number;
  notes?: string;
}

// Stock
export interface Stock {
  id: string;
  name: string;
  type: 'mentah' | 'terpakai' | 'baru';
  karung: number;
  kg: number;
  date: string;
}

// Summary statistics
export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  totalCash: number;
  netProfit: number;
  totalReceivables: number;
  totalKasbon: number;
  incomeChange: number;
  expenseChange: number;
}

// Reseller
export interface Reseller {
  id: string;
  name: string;
  totalTransactions: number;
  totalAmount: number;
  lastTransaction: string;
}
