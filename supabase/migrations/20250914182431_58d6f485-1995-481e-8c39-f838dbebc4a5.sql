-- Insert demo customers
INSERT INTO public.customers (name, contact, address, gst_number, created_by)
VALUES 
  ('Spice World Restaurant', '+91 98765 43210', '123 Market Street, Mumbai, Maharashtra 400001', '27ABCDE1234F1Z5', NULL),
  ('Royal Kitchen Supplies', '+91 87654 32109', '456 Trade Center, Delhi 110001', '07FGHIJ5678K2L6', NULL),
  ('Golden Curry House', '+91 76543 21098', '789 Food Plaza, Bangalore, Karnataka 560001', '29MNOPQ9012R3S7', NULL),
  ('Masala Magic Catering', '+91 65432 10987', '321 Business Park, Pune, Maharashtra 411001', '27TUVWX3456Y4Z8', NULL),
  ('Authentic Flavors Ltd', '+91 54321 09876', '654 Industrial Area, Chennai, Tamil Nadu 600001', '33ABCDE7890F5G9', NULL);

-- Note: We'll need to create actual users through Supabase Auth for the profiles
-- The profiles will be automatically created via the handle_new_user trigger

-- For now, let's create some sample orders after we have users
-- This will be populated once we have actual user accounts