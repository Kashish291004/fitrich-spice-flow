-- Insert demo data for testing
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@fitrich.com', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"username": "admin", "full_name": "Admin User", "role": "admin"}'),
  ('b1ffcd88-8d1a-5fg9-cc7e-7cc8ce490b22', 'salesman@fitrich.com', crypt('sales123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"username": "salesman1", "full_name": "Sales Person", "role": "salesman"}');

-- Insert demo products
INSERT INTO public.products (name, unit, price_per_unit, gst_percentage, opening_stock, current_stock, low_stock_threshold)
VALUES 
  ('Turmeric Powder', 'kg', 150.00, 5.0, 100.0, 85.0, 10.0),
  ('Red Chili Powder', 'kg', 200.00, 5.0, 80.0, 65.0, 10.0),
  ('Coriander Powder', 'kg', 120.00, 5.0, 120.0, 95.0, 15.0),
  ('Garam Masala', 'packet', 50.00, 12.0, 200.0, 180.0, 20.0),
  ('Cumin Seeds', 'kg', 180.00, 5.0, 60.0, 8.0, 10.0);

-- Insert demo customers
INSERT INTO public.customers (name, contact, gst_number, address, created_by)
VALUES 
  ('ABC Spices Pvt Ltd', '+91-9876543210', '27AABCU9603R1ZX', 'Mumbai, Maharashtra', (SELECT id FROM public.profiles WHERE username = 'salesman1')),
  ('XYZ Restaurant Chain', '+91-9876543211', '27AABCU9603R1ZY', 'Pune, Maharashtra', (SELECT id FROM public.profiles WHERE username = 'salesman1')),
  ('Local Market Store', '+91-9876543212', NULL, 'Nashik, Maharashtra', (SELECT id FROM public.profiles WHERE username = 'salesman1'));