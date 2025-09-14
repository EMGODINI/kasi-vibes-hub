-- Create transport_routes table for storing public transport route information
CREATE TABLE transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  route_number VARCHAR(50) NOT NULL, -- e.g., "BRT01", "R102", "Metro Blue Line"
  route_name VARCHAR(255) NOT NULL, -- e.g., "Johannesburg - Pretoria Express"
  transport_type VARCHAR(50) NOT NULL, -- 'bus', 'train', 'taxi', 'brt', 'metro'
  operator VARCHAR(100), -- e.g., "Metrobus", "Gautrain", "Rea Vaya"
  start_location VARCHAR(255) NOT NULL,
  end_location VARCHAR(255) NOT NULL,
  route_path JSONB, -- GeoJSON or array of stops
  is_active BOOLEAN DEFAULT TRUE,
  average_duration_minutes INTEGER,
  fare_price NUMERIC(10,2)
);

-- Enable RLS for transport_routes table
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all active transport routes
CREATE POLICY "Users can view all active transport routes" ON transport_routes
  FOR SELECT USING (is_active = TRUE);

-- Create transport_stops table for individual stops along routes
CREATE TABLE transport_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  stop_name VARCHAR(255) NOT NULL,
  stop_code VARCHAR(50), -- Official stop code if available
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  address TEXT,
  facilities JSONB, -- e.g., {"wheelchair_accessible": true, "shelter": true, "parking": false}
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS for transport_stops table
ALTER TABLE transport_stops ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all active transport stops
CREATE POLICY "Users can view all active transport stops" ON transport_stops
  FOR SELECT USING (is_active = TRUE);

-- Create route_stops junction table (many-to-many relationship)
CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES transport_stops(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL, -- Order of stop along the route
  arrival_offset_minutes INTEGER, -- Minutes from route start to this stop
  UNIQUE (route_id, stop_id),
  UNIQUE (route_id, stop_order)
);

-- Enable RLS for route_stops table
ALTER TABLE route_stops ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all route stops
CREATE POLICY "Users can view all route stops" ON route_stops
  FOR SELECT USING (TRUE);

-- Create transport_schedules table for timetable information
CREATE TABLE transport_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  arrival_time TIME,
  days_of_week INTEGER[] NOT NULL, -- Array: [1,2,3,4,5] for Mon-Fri, [6,7] for weekends
  frequency_minutes INTEGER, -- For high-frequency services
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT -- e.g., "Peak hours only", "Reduced service"
);

-- Enable RLS for transport_schedules table
ALTER TABLE transport_schedules ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all active transport schedules
CREATE POLICY "Users can view all active transport schedules" ON transport_schedules
  FOR SELECT USING (is_active = TRUE);

-- Create transport_alerts table for service disruptions
CREATE TABLE transport_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'delay', 'cancellation', 'disruption', 'maintenance'
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  affected_stops UUID[], -- Array of stop IDs
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  source VARCHAR(100), -- 'official', 'user_report', 'api'
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Enable RLS for transport_alerts table
ALTER TABLE transport_alerts ENABLE ROW LEVEL SECURITY;

-- Policy for users to view all active transport alerts
CREATE POLICY "Users can view all active transport alerts" ON transport_alerts
  FOR SELECT USING (is_active = TRUE);

-- Policy for users to create transport alerts (user reports)
CREATE POLICY "Users can create transport alerts" ON transport_alerts
  FOR INSERT WITH CHECK (auth.uid() = reported_by AND source = 'user_report');

-- Policy for users to update their own transport alerts
CREATE POLICY "Users can update their own transport alerts" ON transport_alerts
  FOR UPDATE USING (auth.uid() = reported_by);

-- Create indexes for better performance
CREATE INDEX idx_transport_routes_type ON transport_routes(transport_type);
CREATE INDEX idx_transport_routes_active ON transport_routes(is_active);
CREATE INDEX idx_transport_stops_location ON transport_stops(latitude, longitude);
CREATE INDEX idx_route_stops_route_order ON route_stops(route_id, stop_order);
CREATE INDEX idx_transport_schedules_route_time ON transport_schedules(route_id, departure_time);
CREATE INDEX idx_transport_alerts_active_route ON transport_alerts(is_active, route_id);
CREATE INDEX idx_transport_alerts_time_range ON transport_alerts(start_time, end_time);

-- Insert some sample South African transport data
INSERT INTO transport_routes (route_number, route_name, transport_type, operator, start_location, end_location, average_duration_minutes, fare_price) VALUES
('BRT01', 'Rea Vaya Trunk Route', 'brt', 'Rea Vaya', 'Soweto', 'Johannesburg CBD', 45, 15.50),
('R102', 'Johannesburg - Pretoria', 'taxi', 'Various Operators', 'Johannesburg', 'Pretoria', 60, 25.00),
('Blue Line', 'Gautrain Blue Line', 'train', 'Gautrain', 'OR Tambo Airport', 'Pretoria', 50, 180.00),
('M01', 'Metrobus Route 1', 'bus', 'Metrobus', 'Alexandra', 'Sandton', 35, 12.00);

INSERT INTO transport_stops (stop_name, stop_code, latitude, longitude, address) VALUES
('Johannesburg Park Station', 'JHB001', -26.2041, 28.0473, 'Rissik Street, Johannesburg CBD'),
('Sandton Station', 'SDN001', -26.1076, 28.0567, 'Rivonia Road, Sandton'),
('OR Tambo Airport', 'ORT001', -26.1367, 28.2411, 'OR Tambo International Airport'),
('Pretoria Station', 'PTA001', -25.7479, 28.2293, 'Paul Kruger Street, Pretoria CBD'),
('Soweto Station', 'SOW001', -26.2678, 27.8546, 'Klipspruit West, Soweto');

-- Function to update transport_alerts updated_at timestamp
CREATE OR REPLACE FUNCTION update_transport_alerts_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for transport_alerts updates
CREATE TRIGGER transport_alerts_updated_at_trigger
BEFORE UPDATE ON transport_alerts
FOR EACH ROW EXECUTE FUNCTION update_transport_alerts_updated_at();

