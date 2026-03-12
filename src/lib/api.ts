export const API_BASE_URL = import.meta.env.PROD ? '/backend/api' : 'http://localhost:8000/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  };

  const response = await fetch(url, finalOptions);
  
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }
    return data as T;
  } catch (e: any) {
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    // If it's not JSON but was OK, return the text or throw
    throw new Error('Invalid JSON response from server');
  }
}

export const api = {
  // --- Incomes ---
  getIncomes: () => fetchApi<any[]>('incomes.php'),
  createIncome: (data: any) => fetchApi('incomes.php', { method: 'POST', body: JSON.stringify(data) }),
  updateIncome: (data: any) => fetchApi('incomes.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteIncome: (id: string) => fetchApi(`incomes.php?id=${id}`, { method: 'DELETE' }),

  // --- Expenses ---
  getExpenses: () => fetchApi<any[]>('expenses.php'),
  createExpense: (data: any) => fetchApi('expenses.php', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (data: any) => fetchApi('expenses.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id: string) => fetchApi(`expenses.php?id=${id}`, { method: 'DELETE' }),

  // --- Transfers ---
  getTransfers: () => fetchApi<any[]>('transfers.php'),
  createTransfer: (data: any) => fetchApi('transfers.php', { method: 'POST', body: JSON.stringify(data) }),
  updateTransfer: (data: any) => fetchApi('transfers.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransfer: (id: string) => fetchApi(`transfers.php?id=${id}`, { method: 'DELETE' }),

  // --- Receivables ---
  getReceivables: () => fetchApi<any[]>('receivables.php'),
  createReceivable: (data: any) => fetchApi('receivables.php', { method: 'POST', body: JSON.stringify({ action: 'create_receivable', ...data }) }),
  updateReceivable: (data: any) => fetchApi('receivables.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteReceivable: (id: string) => fetchApi(`receivables.php`, { method: 'DELETE', body: JSON.stringify({ action: 'delete_receivable', id }) }),
  addReceivablePayment: (data: any) => fetchApi('receivables.php', { method: 'POST', body: JSON.stringify({ action: 'add_payment', ...data }) }),
  deleteReceivablePayment: (data: any) => fetchApi('receivables.php', { method: 'DELETE', body: JSON.stringify({ action: 'delete_payment', ...data }) }),

  // --- Kasbon ---
  getKasbons: () => fetchApi<any[]>('kasbons.php'),
  createKasbon: (data: any) => fetchApi('kasbons.php', { method: 'POST', body: JSON.stringify({ action: 'create_kasbon', ...data }) }),
  updateKasbon: (data: any) => fetchApi('kasbons.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteKasbon: (id: string) => fetchApi(`kasbons.php`, { method: 'DELETE', body: JSON.stringify({ action: 'delete_kasbon', id }) }),
  addKasbonPayment: (data: any) => fetchApi('kasbons.php', { method: 'POST', body: JSON.stringify({ action: 'add_payment', ...data }) }),
  deleteKasbonPayment: (data: any) => fetchApi('kasbons.php', { method: 'DELETE', body: JSON.stringify({ action: 'delete_payment', ...data }) }),

  // --- Stocks ---
  getStocks: () => fetchApi<any[]>('stocks.php'),
  createStock: (data: any) => fetchApi('stocks.php', { method: 'POST', body: JSON.stringify(data) }),
  updateStock: (data: any) => fetchApi('stocks.php', { method: 'PUT', body: JSON.stringify(data) }),
  deleteStock: (id: string) => fetchApi(`stocks.php?id=${id}`, { method: 'DELETE' }),

  // --- Dashboard ---
  getDashboardSummary: () => fetchApi<any>('dashboard.php')
};
