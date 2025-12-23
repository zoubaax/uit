-- Enable Row Level Security on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_evaluations ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Return false if user_id is NULL (anonymous users)
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMINS TABLE POLICIES
-- ============================================

-- Public SELECT access
CREATE POLICY "Admins: Public SELECT"
  ON admins
  FOR SELECT
  TO public
  USING (true);

-- Only admins can INSERT
CREATE POLICY "Admins: Admin INSERT"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can UPDATE
CREATE POLICY "Admins: Admin UPDATE"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can DELETE
CREATE POLICY "Admins: Admin DELETE"
  ON admins
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- TEAMS TABLE POLICIES
-- ============================================

-- Public SELECT access
CREATE POLICY "Teams: Public SELECT"
  ON teams
  FOR SELECT
  TO public
  USING (true);

-- Only admins can INSERT
CREATE POLICY "Teams: Admin INSERT"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can UPDATE
CREATE POLICY "Teams: Admin UPDATE"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can DELETE
CREATE POLICY "Teams: Admin DELETE"
  ON teams
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- NOTES TABLE POLICIES
-- ============================================

-- Public SELECT access
CREATE POLICY "Notes: Public SELECT"
  ON notes
  FOR SELECT
  TO public
  USING (true);

-- Admins can INSERT (with created_by) OR anonymous INSERT (created_by = null)
CREATE POLICY "Notes: Admin or Anonymous INSERT"
  ON notes
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow if user is admin (can set created_by)
    (is_admin(auth.uid()) AND created_by = auth.uid())
    OR
    -- Allow anonymous inserts (created_by must be null)
    (auth.uid() IS NULL AND created_by IS NULL)
  );

-- Only admins can UPDATE
CREATE POLICY "Notes: Admin UPDATE"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can DELETE
CREATE POLICY "Notes: Admin DELETE"
  ON notes
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- ============================================
-- WEEKLY_EVALUATIONS TABLE POLICIES
-- ============================================

-- Public SELECT access
CREATE POLICY "Weekly Evaluations: Public SELECT"
  ON weekly_evaluations
  FOR SELECT
  TO public
  USING (true);

-- Only admins can INSERT
CREATE POLICY "Weekly Evaluations: Admin INSERT"
  ON weekly_evaluations
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can UPDATE
CREATE POLICY "Weekly Evaluations: Admin UPDATE"
  ON weekly_evaluations
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can DELETE
CREATE POLICY "Weekly Evaluations: Admin DELETE"
  ON weekly_evaluations
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

