-- Add ticketing integration fields to gigs table
ALTER TABLE gigs ADD COLUMN ticket_platform VARCHAR(100); -- e.g., 'eventbrite', 'ticketmaster', 'webtickets'
ALTER TABLE gigs ADD COLUMN ticket_url TEXT;
ALTER TABLE gigs ADD COLUMN ticket_price_min NUMERIC(10,2);
ALTER TABLE gigs ADD COLUMN ticket_price_max NUMERIC(10,2);
ALTER TABLE gigs ADD COLUMN tickets_available INTEGER;
ALTER TABLE gigs ADD COLUMN early_bird_price NUMERIC(10,2);
ALTER TABLE gigs ADD COLUMN early_bird_deadline TIMESTAMP WITH TIME ZONE;

-- Create ticket_purchases table for tracking (if we implement our own ticketing)
CREATE TABLE ticket_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_type VARCHAR(100), -- e.g., 'general', 'vip', 'early_bird'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_reference VARCHAR(255),
  ticket_code VARCHAR(100) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS for ticket_purchases table
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own ticket purchases
CREATE POLICY "Users can view their own ticket purchases" ON ticket_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to create ticket purchases
CREATE POLICY "Users can create ticket purchases" ON ticket_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for gig owners to view purchases for their gigs
CREATE POLICY "Gig owners can view purchases for their gigs" ON ticket_purchases
  FOR SELECT USING (EXISTS (SELECT 1 FROM gigs WHERE id = gig_id AND user_id = auth.uid()));

-- Create ticket_types table for flexible ticket pricing
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  type_name VARCHAR(100) NOT NULL, -- e.g., 'General Admission', 'VIP', 'Early Bird'
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity_available INTEGER,
  quantity_sold INTEGER DEFAULT 0,
  sale_start_date TIMESTAMP WITH TIME ZONE,
  sale_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS for ticket_types table
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all active ticket types
CREATE POLICY "Users can view all active ticket types" ON ticket_types
  FOR SELECT USING (is_active = TRUE);

-- Policy for gig owners to manage their ticket types
CREATE POLICY "Gig owners can manage their ticket types" ON ticket_types
  FOR ALL USING (EXISTS (SELECT 1 FROM gigs WHERE id = gig_id AND user_id = auth.uid()));

-- Function to update quantity_sold when tickets are purchased
CREATE OR REPLACE FUNCTION update_ticket_type_sold_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ticket_types
    SET quantity_sold = quantity_sold + NEW.quantity
    WHERE gig_id = NEW.gig_id AND type_name = NEW.ticket_type;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ticket_types
    SET quantity_sold = quantity_sold - OLD.quantity
    WHERE gig_id = OLD.gig_id AND type_name = OLD.ticket_type;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ticket purchases to update sold count
CREATE TRIGGER ticket_purchases_sold_count_trigger
AFTER INSERT OR DELETE ON ticket_purchases
FOR EACH ROW EXECUTE FUNCTION update_ticket_type_sold_count();

