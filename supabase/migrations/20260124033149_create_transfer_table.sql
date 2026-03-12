-- Create transfer table
CREATE TABLE transfer (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  name text NOT NULL,
  amount numeric NOT NULL,
  payung_meja numeric,
  piutang_lunas numeric,
  uang numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);
