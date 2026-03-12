-- Create expense category enum
CREATE TYPE expense_category AS ENUM (
  'gas_tabung',
  'makan_siang',
  'operasional',
  'transport',
  'kasbon',
  'ongkir',
  'perlengkapan',
  'lainnya'
);

-- Create expenses table
CREATE TABLE expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  description text NOT NULL,
  category expense_category NOT NULL,
  amount numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);
