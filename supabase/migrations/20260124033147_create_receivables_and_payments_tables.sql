-- Create receivable type enum
CREATE TYPE receivable_type AS ENUM ('payung_meja', 'piutang');

-- Create receivable status enum
CREATE TYPE receivable_status AS ENUM ('active', 'paid');

-- Create receivables table
CREATE TABLE receivables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  type receivable_type NOT NULL,
  total_amount numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  status receivable_status DEFAULT 'active' NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create payments table
CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  receivable_id uuid REFERENCES receivables(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);
