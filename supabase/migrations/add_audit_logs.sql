-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID NOT NULL,
  actor_email TEXT,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on actor_id for faster queries
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);

-- Create index on action for filtering
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Create index on created_at for time-based queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create index on resource
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Add RLS policy (only admins can read audit logs)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read all audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Note: Audit log inserts are done via service role, so no INSERT policy needed
