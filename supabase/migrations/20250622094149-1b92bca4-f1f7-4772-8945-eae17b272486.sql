
-- Check current admin users and their email addresses
SELECT 
  p.email,
  p.username,
  ur.role,
  ur.created_at as role_assigned_at
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at;
