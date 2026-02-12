-- Fix Supabase linter warnings:
-- 1. Function search_path (security)
-- 2. Auth RLS initplan on users (performance)
-- 3. Multiple permissive policies → single policy per table/action (performance)

-- ========== 1. Set search_path on helper functions ==========
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_my_zone_id()
RETURNS uuid AS $$
  SELECT zone_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_app_user()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ========== 2 & 3. USERS: fix auth initplan + single policy ==========
DROP POLICY IF EXISTS "users_admin_all" ON public.users;
DROP POLICY IF EXISTS "users_secretariat_all" ON public.users;
DROP POLICY IF EXISTS "users_zonal_leader_own" ON public.users;

CREATE POLICY "users_all" ON public.users
  FOR ALL USING (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
    OR (
      public.get_my_role() = 'zonal_leader'
      AND (id = (SELECT auth.uid()) OR zone_id = public.get_my_zone_id())
    )
  );

-- ========== 3. ZONES: single policy per action ==========
DROP POLICY IF EXISTS "zones_admin_all" ON public.zones;
DROP POLICY IF EXISTS "zones_secretariat_select" ON public.zones;
DROP POLICY IF EXISTS "zones_zonal_leader_select" ON public.zones;

CREATE POLICY "zones_all" ON public.zones
  FOR ALL USING (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
    OR (public.get_my_role() = 'zonal_leader' AND id = public.get_my_zone_id())
  );

-- ========== 3. EVENTS: single policy ==========
DROP POLICY IF EXISTS "events_admin_all" ON public.events;
DROP POLICY IF EXISTS "events_secretariat_select" ON public.events;
DROP POLICY IF EXISTS "events_zonal_leader_select" ON public.events;

CREATE POLICY "events_all" ON public.events
  FOR ALL USING (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
    OR public.get_my_role() = 'zonal_leader'
  );

-- ========== 3. GUESTS: one policy per action ==========
DROP POLICY IF EXISTS "guests_admin_all" ON public.guests;
DROP POLICY IF EXISTS "guests_secretariat_all" ON public.guests;
DROP POLICY IF EXISTS "guests_zonal_leader_insert" ON public.guests;
DROP POLICY IF EXISTS "guests_zonal_leader_select" ON public.guests;

CREATE POLICY "guests_select" ON public.guests
  FOR SELECT USING (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
    OR public.get_my_role() = 'zonal_leader'
  );

CREATE POLICY "guests_insert" ON public.guests
  FOR INSERT WITH CHECK (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
    OR public.get_my_role() = 'zonal_leader'
  );

CREATE POLICY "guests_update" ON public.guests
  FOR UPDATE USING (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
  );

CREATE POLICY "guests_delete" ON public.guests
  FOR DELETE USING (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
  );

-- ========== 3. ATTENDANCE: single policy ==========
DROP POLICY IF EXISTS "attendance_admin_all" ON public.attendance;
DROP POLICY IF EXISTS "attendance_secretariat_all" ON public.attendance;
DROP POLICY IF EXISTS "attendance_zonal_leader_all" ON public.attendance;

CREATE POLICY "attendance_all" ON public.attendance
  FOR ALL USING (
    public.get_my_role() = 'admin'
    OR public.get_my_role() = 'secretariat'
    OR (
      public.get_my_role() = 'zonal_leader'
      AND zone_id = public.get_my_zone_id()
    )
  );
