-- Create resellers table
CREATE TABLE resellers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  total_transactions integer DEFAULT 0,
  total_amount numeric DEFAULT 0,
  last_transaction timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);
