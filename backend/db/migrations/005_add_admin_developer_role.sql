-- Add adminDeveloper role to the users table
-- This migration modifies the role CHECK constraint to allow 'admin', 'basic', and 'adminDeveloper'

-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new constraint with adminDeveloper role
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'basic', 'adminDeveloper'));
