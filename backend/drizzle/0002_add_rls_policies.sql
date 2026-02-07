-- Helper: current user's role and zone_id from public.users (only for loginable users)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS uuid AS $$
  SELECT zone_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_app_user()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========== USERS ==========
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_admin_all" ON public.users;
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "users_secretariat_all" ON public.users;
CREATE POLICY "users_secretariat_all" ON public.users
  FOR ALL USING (public.get_my_role() = 'secretariat');

DROP POLICY IF EXISTS "users_zonal_leader_own" ON public.users;
CREATE POLICY "users_zonal_leader_own" ON public.users
  FOR ALL USING (
    public.get_my_role() = 'zonal_leader'
    AND (
      id = auth.uid()
      OR zone_id = public.get_my_zone_id()
    )
  );

-- ========== ZONES ==========
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "zones_admin_all" ON public.zones;
CREATE POLICY "zones_admin_all" ON public.zones
  FOR ALL USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "zones_secretariat_select" ON public.zones;
CREATE POLICY "zones_secretariat_select" ON public.zones
  FOR SELECT USING (public.get_my_role() = 'secretariat');

DROP POLICY IF EXISTS "zones_zonal_leader_select" ON public.zones;
CREATE POLICY "zones_zonal_leader_select" ON public.zones
  FOR SELECT USING (
    public.get_my_role() = 'zonal_leader'
    AND id = public.get_my_zone_id()
  );

-- ========== EVENTS ==========
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_admin_all" ON public.events;
CREATE POLICY "events_admin_all" ON public.events
  FOR ALL USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "events_secretariat_select" ON public.events;
CREATE POLICY "events_secretariat_select" ON public.events
  FOR SELECT USING (public.get_my_role() = 'secretariat');

DROP POLICY IF EXISTS "events_zonal_leader_select" ON public.events;
CREATE POLICY "events_zonal_leader_select" ON public.events
  FOR SELECT USING (public.get_my_role() = 'zonal_leader');

-- ========== GUESTS ==========
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guests_admin_all" ON public.guests;
CREATE POLICY "guests_admin_all" ON public.guests
  FOR ALL USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "guests_secretariat_all" ON public.guests;
CREATE POLICY "guests_secretariat_all" ON public.guests
  FOR ALL USING (public.get_my_role() = 'secretariat');

DROP POLICY IF EXISTS "guests_zonal_leader_insert" ON public.guests;
CREATE POLICY "guests_zonal_leader_insert" ON public.guests
  FOR INSERT WITH CHECK (public.get_my_role() = 'zonal_leader');

DROP POLICY IF EXISTS "guests_zonal_leader_select" ON public.guests;
CREATE POLICY "guests_zonal_leader_select" ON public.guests
  FOR SELECT USING (public.get_my_role() = 'zonal_leader');

-- ========== ATTENDANCE ==========
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_admin_all" ON public.attendance;
CREATE POLICY "attendance_admin_all" ON public.attendance
  FOR ALL USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "attendance_secretariat_all" ON public.attendance;
CREATE POLICY "attendance_secretariat_all" ON public.attendance
  FOR ALL USING (public.get_my_role() = 'secretariat');

DROP POLICY IF EXISTS "attendance_zonal_leader_all" ON public.attendance;
CREATE POLICY "attendance_zonal_leader_all" ON public.attendance
  FOR ALL USING (
    public.get_my_role() = 'zonal_leader'
    AND zone_id = public.get_my_zone_id()
  );
