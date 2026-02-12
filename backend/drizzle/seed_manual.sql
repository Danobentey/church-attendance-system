-- Run this in Supabase SQL Editor when you cannot run npm run db:seed from your machine (e.g. ENOTFOUND on db.xxx.supabase.co).
-- Step 1: Insert zones (idempotent)
INSERT INTO public.zones (name, abbreviation)
VALUES
  ('Egbeda', 'EGB'),
  ('Ikeja', 'IKJ'),
  ('Surulere', 'SRL')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Admin user
-- You must create the admin in Supabase first: Authentication → Users → Add user
--   Email: admin@church.org
--   Password: (e.g. admin123456)
-- Then copy the user's UUID from the Users list and run the following, replacing YOUR_ADMIN_AUTH_UID:

/*
DELETE FROM public.users WHERE email = 'admin@church.org';
INSERT INTO public.users (id, email, phone_number, first_name, last_name, role, status)
VALUES (
  'YOUR_ADMIN_AUTH_UID'::uuid,
  'admin@church.org',
  '08000000000',
  'System',
  'Admin',
  'admin',
  'active'
);
*/

-- Step 3 (optional): Sample members (no login). Run after zones exist.
INSERT INTO public.users (
  id,
  phone_number,
  first_name,
  last_name,
  role,
  zone_id,
  zone_identifier,
  status
)
SELECT
  gen_random_uuid(),
  '08011111111',
  'John',
  'Doe',
  'member',
  z.id,
  'EGB001',
  'active'
FROM public.zones z WHERE z.name = 'Egbeda' LIMIT 1
ON CONFLICT (zone_identifier) DO NOTHING;

INSERT INTO public.users (
  id,
  phone_number,
  first_name,
  last_name,
  role,
  zone_id,
  zone_identifier,
  status
)
SELECT
  gen_random_uuid(),
  '08022222222',
  'Jane',
  'Smith',
  'member',
  z.id,
  'EGB002',
  'active'
FROM public.zones z WHERE z.name = 'Egbeda' LIMIT 1
ON CONFLICT (zone_identifier) DO NOTHING;

INSERT INTO public.users (
  id,
  phone_number,
  first_name,
  last_name,
  role,
  zone_id,
  zone_identifier,
  status
)
SELECT
  gen_random_uuid(),
  '08033333333',
  'Chidi',
  'Okeke',
  'member',
  z.id,
  'IKJ001',
  'active'
FROM public.zones z WHERE z.name = 'Ikeja' LIMIT 1
ON CONFLICT (zone_identifier) DO NOTHING;
