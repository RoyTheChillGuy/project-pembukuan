-- Create stock type enum
CREATE TYPE stock_type AS ENUM ('mentah', 'terpakai', 'baru');

-- Create stock table
CREATE TABLE stock (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type stock_type NOT NULL,
  karung integer NOT NULL,
  kg numeric NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
