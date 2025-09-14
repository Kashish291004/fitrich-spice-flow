-- Insert demo products only
INSERT INTO public.products (name, unit, price_per_unit, gst_percentage, opening_stock, current_stock, low_stock_threshold)
VALUES 
  ('Turmeric Powder', 'kg', 150.00, 5.0, 100.0, 85.0, 10.0),
  ('Red Chili Powder', 'kg', 200.00, 5.0, 80.0, 65.0, 10.0),
  ('Coriander Powder', 'kg', 120.00, 5.0, 120.0, 95.0, 15.0),
  ('Garam Masala', 'packet', 50.00, 12.0, 200.0, 180.0, 20.0),
  ('Cumin Seeds', 'kg', 180.00, 5.0, 60.0, 8.0, 10.0)
ON CONFLICT DO NOTHING;