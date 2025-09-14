-- Create moderation_reports table for user reports
CREATE TABLE moderation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'profile', 'gig', 'skate_spot', etc.
  reported_content_id UUID NOT NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_reason VARCHAR(100) NOT NULL, -- 'spam', 'harassment', 'inappropriate_content', 'fake_profile', etc.
  report_description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderator_notes TEXT,
  resolution_action VARCHAR(100), -- 'no_action', 'content_removed', 'user_warned', 'user_suspended', 'user_banned'
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for moderation_reports table
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;

-- Policy for users to create reports
CREATE POLICY "Users can create moderation reports" ON moderation_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Policy for users to view their own reports
CREATE POLICY "Users can view their own reports" ON moderation_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Policy for moderators to view and manage all reports
CREATE POLICY "Moderators can manage all reports" ON moderation_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
    )
  );

-- Create moderation_actions table for tracking all moderation actions
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL, -- 'content_removed', 'user_warned', 'user_suspended', 'user_banned', 'content_approved'
  target_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'profile', 'user'
  target_id UUID NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  duration_hours INTEGER, -- For temporary actions like suspensions
  is_active BOOLEAN DEFAULT TRUE,
  related_report_id UUID REFERENCES moderation_reports(id) ON DELETE SET NULL,
  additional_notes TEXT
);

-- Enable RLS for moderation_actions table
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- Policy for moderators to manage moderation actions
CREATE POLICY "Moderators can manage moderation actions" ON moderation_actions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
    )
  );

-- Policy for users to view actions taken against them
CREATE POLICY "Users can view actions against them" ON moderation_actions
  FOR SELECT USING (auth.uid() = target_user_id);

-- Create content_flags table for automated content flagging
CREATE TABLE content_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  content_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  flag_type VARCHAR(100) NOT NULL, -- 'spam_detected', 'profanity_detected', 'duplicate_content', 'suspicious_activity'
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  flag_details JSONB, -- Additional details about the flag
  is_reviewed BOOLEAN DEFAULT FALSE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_decision VARCHAR(50), -- 'approved', 'removed', 'needs_human_review'
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for content_flags table
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

-- Policy for moderators to view and manage content flags
CREATE POLICY "Moderators can manage content flags" ON content_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
    )
  );

-- Create community_moderators table for page-specific moderators
CREATE TABLE community_moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  page_slug VARCHAR(100) NOT NULL, -- 'skaters-street', 'groovist', etc.
  moderator_level VARCHAR(50) DEFAULT 'moderator', -- 'moderator', 'admin'
  permissions JSONB NOT NULL, -- Array of permissions like ['remove_posts', 'ban_users', 'edit_content']
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE (user_id, page_slug)
);

-- Enable RLS for community_moderators table
ALTER TABLE community_moderators ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage community moderators
CREATE POLICY "Admins can manage community moderators" ON community_moderators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy for users to view their own moderator status
CREATE POLICY "Users can view their own moderator status" ON community_moderators
  FOR SELECT USING (auth.uid() = user_id);

-- Create user_warnings table for tracking warnings
CREATE TABLE user_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  warning_type VARCHAR(100) NOT NULL, -- 'content_violation', 'behavior_warning', 'spam_warning'
  warning_message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  related_content_type VARCHAR(50),
  related_content_id UUID,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for user_warnings table
ALTER TABLE user_warnings ENABLE ROW LEVEL SECURITY;

-- Policy for moderators to manage warnings
CREATE POLICY "Moderators can manage warnings" ON user_warnings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'moderator')
    )
  );

-- Policy for users to view their own warnings
CREATE POLICY "Users can view their own warnings" ON user_warnings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to acknowledge their warnings
CREATE POLICY "Users can acknowledge their warnings" ON user_warnings
  FOR UPDATE USING (auth.uid() = user_id AND NOT is_acknowledged);

-- Function to check if user is moderator for a specific page
CREATE OR REPLACE FUNCTION is_page_moderator(user_uuid UUID, page_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_moderators cm
    JOIN profiles p ON cm.user_id = p.id
    WHERE cm.user_id = user_uuid 
      AND cm.page_slug = page_name 
      AND cm.is_active = TRUE
      AND (p.role = 'admin' OR p.role = 'moderator' OR cm.moderator_level IS NOT NULL)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get moderation queue for a moderator
CREATE OR REPLACE FUNCTION get_moderation_queue(moderator_uuid UUID, page_filter TEXT DEFAULT NULL)
RETURNS TABLE(
  report_id UUID,
  content_type VARCHAR(50),
  content_id UUID,
  reporter_username VARCHAR(255),
  reported_username VARCHAR(255),
  reason VARCHAR(100),
  description TEXT,
  priority VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.id as report_id,
    mr.reported_content_type as content_type,
    mr.reported_content_id as content_id,
    reporter.username as reporter_username,
    reported.username as reported_username,
    mr.report_reason as reason,
    mr.report_description as description,
    mr.priority,
    mr.created_at
  FROM moderation_reports mr
  LEFT JOIN profiles reporter ON mr.reporter_id = reporter.id
  LEFT JOIN profiles reported ON mr.reported_user_id = reported.id
  WHERE mr.status = 'pending'
    AND (page_filter IS NULL OR mr.reported_content_type LIKE '%' || page_filter || '%')
  ORDER BY 
    CASE mr.priority 
      WHEN 'urgent' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    mr.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to resolve moderation report
CREATE OR REPLACE FUNCTION resolve_moderation_report(
  report_uuid UUID,
  moderator_uuid UUID,
  resolution VARCHAR(100),
  notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update the report
  UPDATE moderation_reports 
  SET 
    status = 'resolved',
    moderator_id = moderator_uuid,
    moderator_notes = notes,
    resolution_action = resolution,
    resolved_at = now(),
    updated_at = now()
  WHERE id = report_uuid;

  -- Create moderation action record
  INSERT INTO moderation_actions (
    moderator_id,
    action_type,
    target_type,
    target_id,
    target_user_id,
    reason,
    related_report_id,
    additional_notes
  )
  SELECT 
    moderator_uuid,
    resolution,
    mr.reported_content_type,
    mr.reported_content_id,
    mr.reported_user_id,
    mr.report_reason,
    mr.id,
    notes
  FROM moderation_reports mr
  WHERE mr.id = report_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user warning
CREATE OR REPLACE FUNCTION create_user_warning(
  target_user_uuid UUID,
  moderator_uuid UUID,
  warning_type_param VARCHAR(100),
  message TEXT,
  severity_param VARCHAR(20) DEFAULT 'medium',
  content_type_param VARCHAR(50) DEFAULT NULL,
  content_id_param UUID DEFAULT NULL,
  expires_hours INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  warning_id UUID;
BEGIN
  INSERT INTO user_warnings (
    user_id,
    moderator_id,
    warning_type,
    warning_message,
    severity,
    related_content_type,
    related_content_id,
    expires_at
  ) VALUES (
    target_user_uuid,
    moderator_uuid,
    warning_type_param,
    message,
    severity_param,
    content_type_param,
    content_id_param,
    CASE WHEN expires_hours IS NOT NULL THEN now() + (expires_hours || ' hours')::INTERVAL ELSE NULL END
  ) RETURNING id INTO warning_id;

  RETURN warning_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update moderation_reports updated_at timestamp
CREATE OR REPLACE FUNCTION update_moderation_reports_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for moderation_reports updates
CREATE TRIGGER moderation_reports_updated_at_trigger
BEFORE UPDATE ON moderation_reports
FOR EACH ROW EXECUTE FUNCTION update_moderation_reports_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_moderation_reports_status_priority ON moderation_reports(status, priority, created_at);
CREATE INDEX idx_moderation_reports_content ON moderation_reports(reported_content_type, reported_content_id);
CREATE INDEX idx_moderation_reports_user ON moderation_reports(reported_user_id, status);
CREATE INDEX idx_moderation_actions_moderator ON moderation_actions(moderator_id, created_at);
CREATE INDEX idx_moderation_actions_target ON moderation_actions(target_type, target_id);
CREATE INDEX idx_content_flags_unreviewed ON content_flags(is_reviewed, created_at);
CREATE INDEX idx_community_moderators_page ON community_moderators(page_slug, is_active);
CREATE INDEX idx_user_warnings_user_active ON user_warnings(user_id, expires_at);

-- Insert default community moderator permissions
INSERT INTO community_moderators (user_id, page_slug, moderator_level, permissions, assigned_by)
SELECT 
  p.id,
  'all_pages',
  'admin',
  '["remove_posts", "ban_users", "edit_content", "manage_moderators", "view_reports", "resolve_reports"]'::jsonb,
  p.id
FROM profiles p 
WHERE p.role = 'admin'
ON CONFLICT (user_id, page_slug) DO NOTHING;

