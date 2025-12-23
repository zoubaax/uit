# Team Notes System - Database Schema

This directory contains SQL migration files for setting up the Supabase database schema for the team notes system.

## Database Schema Overview

The system consists of 4 main tables:

1. **admins** - Admin users linked to Supabase Auth
2. **teams** - Team information
3. **notes** - Team notes (can be created by admins or anonymously)
4. **weekly_evaluations** - Weekly team evaluations

## Setup Instructions

### 1. Run Migrations in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migrations in order:
   - `001_initial_schema.sql` - Creates all tables and indexes
   - `002_rls_policies.sql` - Sets up Row Level Security policies
   - `003_disable_auth_registration.sql` - Documentation for disabling registration

### 2. Disable Public Registration

**IMPORTANT**: You must disable public registration in Supabase Auth:

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers** → **Email**
3. Toggle **OFF** "Enable email signup"
4. Save changes

Alternatively, you can use the Supabase Management API to disable signups programmatically.

### 3. Create Initial Admin User

After running migrations, create your first admin user:

```sql
-- First, create the user in Supabase Auth (via Dashboard or Auth API)
-- Then insert into admins table:

INSERT INTO admins (id, email, name)
VALUES (
  'user-uuid-from-auth',  -- Replace with actual auth user UUID
  'admin@example.com',
  'Admin Name'
);
```

## Table Structures

### admins
- `id` (UUID, PK) - References `auth.users(id)`
- `email` (TEXT, UNIQUE) - Admin email
- `name` (TEXT) - Admin name
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### teams
- `id` (UUID, PK) - Team identifier
- `name` (TEXT) - Team name
- `description` (TEXT, nullable) - Team description
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### notes
- `id` (UUID, PK) - Note identifier
- `content` (TEXT) - Note content
- `team_id` (UUID, FK → teams) - Associated team
- `created_by` (UUID, FK → admins, nullable) - Admin who created the note (null for anonymous)
- `created_at` (TIMESTAMPTZ) - Creation timestamp
- `category` (TEXT, nullable) - Note category

### weekly_evaluations
- `id` (UUID, PK) - Evaluation identifier
- `team_id` (UUID, FK → teams) - Associated team
- `rating` (INTEGER, 1-5) - Rating score
- `feedback` (TEXT, nullable) - Feedback text
- `week_start_date` (DATE) - Week start date
- `created_at` (TIMESTAMPTZ) - Creation timestamp

## Row Level Security (RLS) Policies

### Public Access (SELECT)
- **All tables**: Allow `PUBLIC` SELECT access
- Anyone can read data from all tables

### Admin Access (INSERT, UPDATE, DELETE)
- **All tables**: Only authenticated users who are admins can INSERT, UPDATE, DELETE
- Uses the `is_admin()` function to check admin status

### Notes Special Case
- **INSERT**: Allows both:
  - Admins inserting notes with `created_by` set to their user ID
  - Anonymous users inserting notes with `created_by = null`

## Helper Functions

### `is_admin(user_id UUID)`
Returns `true` if the given user ID exists in the `admins` table.

## Usage Examples

### Creating an Anonymous Note
```javascript
import { supabase } from './lib/supabase'

const { data, error } = await supabase
  .from('notes')
  .insert({
    content: 'This is a public note',
    team_id: 'team-uuid',
    created_by: null, // Anonymous note
    category: 'general'
  })
```

### Creating an Admin Note
```javascript
import { supabase } from './lib/supabase'

const { data: { user } } = await supabase.auth.getUser()

const { data, error } = await supabase
  .from('notes')
  .insert({
    content: 'This is an admin note',
    team_id: 'team-uuid',
    created_by: user.id, // Admin user ID
    category: 'important'
  })
```

### Fetching Teams (Public Access)
```javascript
import { supabase } from './lib/supabase'

const { data, error } = await supabase
  .from('teams')
  .select('*')
```

## Security Notes

1. **RLS is enabled** on all tables - policies control access
2. **Public registration is disabled** - only admins can be created manually
3. **Admin checks** use a secure function (`is_admin`) that checks the `admins` table
4. **Anonymous notes** are allowed but cannot be updated or deleted by non-admins
5. **All admin operations** require authentication and admin status verification

## Troubleshooting

### "permission denied" errors
- Ensure RLS policies are applied correctly
- Check that the user is authenticated (for admin operations)
- Verify the user exists in the `admins` table

### Cannot create anonymous notes
- Check that the notes INSERT policy allows `created_by = null`
- Ensure you're not passing an invalid `team_id`

### Admin operations failing
- Verify the user is authenticated: `await supabase.auth.getUser()`
- Check admin status: `await supabase.rpc('is_admin', { user_id: user.id })`
- Ensure the user exists in the `admins` table

