# Project Pembukuan

Aplikasi pembukuan berbasis web untuk mencatat pemasukan, pengeluaran, transfer, piutang, kasbon, pembayaran, dan stok dalam satu dashboard yang lebih rapi dan mudah digunakan.

## Tentang Project

Project ini dibuat sebagai sistem pembukuan sederhana yang berfokus pada pencatatan operasional harian. Repository saat ini menggunakan stack front-end modern berbasis **Vite + React + TypeScript**, serta sudah menyiapkan folder `supabase` dan file `database.sql` untuk kebutuhan data. :contentReference[oaicite:0]{index=0}

## Fitur Utama

- Pencatatan **pemasukan**
- Pencatatan **pengeluaran**
- Pencatatan **transfer**
- Pengelolaan **piutang**
- Pengelolaan **kasbon**
- Pencatatan **pembayaran/cicilan**
- Pengelolaan **stok**
- Export data menggunakan library `xlsx`
- Visualisasi data menggunakan `recharts` :contentReference[oaicite:1]{index=1}

## Struktur Data Utama

Database yang disiapkan pada project ini mencakup tabel berikut:

- `incomes`
- `expenses`
- `transfers`
- `receivables`
- `kasbons`
- `payments`
- `stocks` :contentReference[oaicite:2]{index=2}

## Tech Stack

Project ini menggunakan:

- **Vite**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Router DOM**
- **TanStack React Query**
- **Supabase**
- **Recharts**
- **XLSX**
- **Vitest** :contentReference[oaicite:3]{index=3}

## Struktur Repository

Beberapa file dan folder utama pada repository ini:

- `public/`
- `src/`
- `supabase/`
- `.env`
- `database.sql`
- `package.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `vitest.config.ts` :contentReference[oaicite:4]{index=4}
