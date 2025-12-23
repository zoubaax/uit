# How to Create an Admin Account

Since public registration is disabled, admin accounts must be created manually. Follow these steps:

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Create User in Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** button (or **Invite user**)
4. Fill in the form:
   - **Email**: Enter the admin's email address
   - **Password**: Set a temporary password (user can change it later)
   - **Auto Confirm User**: ✅ Check this box (so they can login immediately)
5. Click **Create user**
6. **Important**: Copy the **User UID** (you'll need it in the next step)

### Step 2: Add User to Admins Table

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL query (replace the values):

```sql
INSERT INTO admins (id, email, name)
VALUES (
  'USER_UID_FROM_STEP_1',  -- Paste the User UID here
  'admin@example.com',     -- Admin email (should match Auth user email)
  'Admin Name'              -- Admin display name
);
```

**Example:**
```sql
INSERT INTO admins (id, email, name)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'admin@company.com',
  'John Doe'
);
```

3. Click **Run** to execute the query
4. Verify the admin was created by running:

```sql
SELECT * FROM admins;
```

### Step 3: Test Login

1. Go to your app's login page: `/admin/login`
2. Sign in with:
   - **Email**: The email you used in Step 1
   - **Password**: The password you set in Step 1
3. You should be redirected to `/admin` dashboard

---

## Method 2: Using Supabase Management API

If you prefer to automate admin creation, you can use the Supabase Management API:

### Step 1: Create Auth User via API

```javascript
// Using Supabase Admin API (requires service_role key)
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY' // ⚠️ Keep this secret!
)

// Create user
const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'secure-password-here',
  email_confirm: true,
  user_metadata: {
    name: 'Admin Name'
  }
})

if (error) {
  console.error('Error creating user:', error)
} else {
  console.log('User created:', user.user.id)
  // Use user.user.id in next step
}
```

### Step 2: Add to Admins Table

```javascript
// Add to admins table
const { error: adminError } = await supabaseAdmin
  .from('admins')
  .insert({
    id: user.user.id, // From Step 1
    email: 'admin@example.com',
    name: 'Admin Name'
  })

if (adminError) {
  console.error('Error adding admin:', adminError)
} else {
  console.log('Admin created successfully!')
}
```

---

## Method 3: One-Step SQL Script (Advanced)

You can create a SQL function to create admins in one step:

```sql
-- Create function to add admin
CREATE OR REPLACE FUNCTION create_admin(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create user in auth.users (requires superuser privileges)
  -- Note: This requires direct database access, not available via SQL Editor
  -- You'll need to use the Management API for this part
  
  -- For now, this function just adds to admins table
  -- User must be created via Dashboard or API first
  INSERT INTO admins (id, email, name)
  VALUES (
    gen_random_uuid(), -- This won't work - need actual auth user ID
    admin_email,
    admin_name
  )
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;
```

**Note**: This method is complex because creating auth users requires admin privileges. Use Method 1 or 2 instead.

---

## Quick Reference

### Check if User is Admin

```sql
-- Check admin status
SELECT * FROM admins WHERE email = 'admin@example.com';
```

### List All Admins

```sql
SELECT 
  a.id,
  a.email,
  a.name,
  a.created_at,
  au.email_confirmed_at
FROM admins a
LEFT JOIN auth.users au ON a.id = au.id;
```

### Remove Admin Access

```sql
-- Remove from admins table (user still exists in auth.users)
DELETE FROM admins WHERE email = 'admin@example.com';
```

### Update Admin Name

```sql
UPDATE admins 
SET name = 'New Name'
WHERE email = 'admin@example.com';
```

---

## Troubleshooting

### "Access denied" after login
- ✅ Verify user exists in `admins` table: `SELECT * FROM admins WHERE id = 'user-id';`
- ✅ Check that the User UID matches between `auth.users` and `admins` table
- ✅ Ensure RLS policies allow reading from `admins` table

### User created but can't login
- ✅ Check "Auto Confirm User" was checked when creating the user
- ✅ Verify email matches in both `auth.users` and `admins` table
- ✅ Try resetting password: Authentication → Users → Reset Password

### User ID mismatch
- ✅ The `id` in `admins` table MUST match the `id` in `auth.users`
- ✅ Copy the User UID exactly from Authentication → Users
- ✅ Use `SELECT id, email FROM auth.users;` to verify the ID

---

## Security Best Practices

1. **Use strong passwords** - Set secure passwords for admin accounts
2. **Limit admin accounts** - Only create admin accounts for trusted users
3. **Regular audits** - Periodically review admin accounts: `SELECT * FROM admins;`
4. **Remove unused admins** - Delete admin accounts when no longer needed
5. **Monitor access** - Check Supabase logs for admin login activity

---

## Example: Complete Admin Creation Script

Here's a complete example you can run in SQL Editor (after creating the user in Dashboard):

```sql
-- Step 1: Get the user ID from auth.users (replace email)
-- Run this first to get the user ID:
-- SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Step 2: Insert into admins table (replace with actual user ID)
INSERT INTO admins (id, email, name)
VALUES (
  'PASTE_USER_ID_HERE',  -- From Step 1
  'admin@example.com',
  'Admin Name'
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    name = EXCLUDED.name;

-- Step 3: Verify
SELECT 
  a.id,
  a.email,
  a.name,
  a.created_at
FROM admins a
WHERE a.email = 'admin@example.com';
```

---

## Need Help?

If you encounter issues:
1. Check the `supabase/README.md` for database setup
2. Verify RLS policies are correctly set up
3. Check Supabase logs for errors
4. Ensure environment variables are configured correctly

