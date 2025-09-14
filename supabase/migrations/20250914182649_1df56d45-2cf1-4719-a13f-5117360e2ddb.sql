-- Insert dummy profiles with fake user_ids for testing
-- Note: In production, these would be created via the handle_new_user trigger when users sign up
INSERT INTO public.profiles (user_id, username, full_name, role, phone, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Admin User', 'admin', '+91 99999 00001', true),
  ('22222222-2222-2222-2222-222222222222', 'salesman1', 'Raj Kumar', 'salesman', '+91 99999 00002', true),
  ('33333333-3333-3333-3333-333333333333', 'salesman2', 'Priya Sharma', 'salesman', '+91 99999 00003', true),
  ('44444444-4444-4444-4444-444444444444', 'manager', 'Suresh Patel', 'admin', '+91 99999 00004', true)
ON CONFLICT (user_id) DO NOTHING;