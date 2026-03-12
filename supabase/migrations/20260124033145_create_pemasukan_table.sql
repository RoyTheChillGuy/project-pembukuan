-- Create income table
CREATE TABLE income (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  reseller_name text NOT NULL,
  kg numeric NOT NULL,
  amount numeric NOT NULL,
  payung_meja numeric,
  piutang_lunas numeric,
  uang numeric,
  payment_method text CHECK (payment_method IN ('cash', 'transfer')) NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);
