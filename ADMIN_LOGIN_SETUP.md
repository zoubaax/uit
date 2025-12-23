# Admin Login System Setup

This document describes the admin login system implementation for the Team Notes application.

## Overview

The admin login system provides:
- **Admin-only authentication** at `/admin/login`
- **Protected admin routes** at `/admin/*`
- **Public routes** at `/*` for viewing data
- **Session management** for authenticated admins
- **Admin verification** by checking the `admins` table

## Features

✅ **Login Page** (`/admin/login`)
- Email/password authentication
- Admin verification after login
- Automatic redirect for already-logged-in admins

✅ **Protected Admin Routes** (`/admin/*`)
- Dashboard at `/admin`
- Teams management at `/admin/teams`
- Notes management at `/admin/notes`
- Evaluations at `/admin/evaluations`
- Automatic redirect to login if not authenticated or not admin

✅ **Public Routes** (`/*`)
- Home page at `/`
- Teams list at `/teams`
- Team detail with notes at `/teams/:teamId`
- No authentication required

✅ **Session Management**
- Persistent sessions via Supabase Auth
- Automatic session restoration on page reload
- Secure sign-out functionality

## File Structure

```
src/
├── contexts/
│   └── AuthContext.jsx          # Authentication context provider
├── components/
│   ├── LoginPage.jsx            # Admin login page
│   ├── AdminLayout.jsx          # Admin dashboard layout
│   ├── PublicLayout.jsx         # Public pages layout
│   └── ProtectedRoute.jsx       # Route protection component
├── pages/
│   ├── AdminDashboard.jsx      # Admin dashboard page
│   ├── PublicHome.jsx          # Public home page
│   └── TeamDetail.jsx          # Team detail page (public)
└── App.jsx                      # Main app with routing
```

## Authentication Flow

1. **User visits `/admin/login`**
   - If already logged in as admin → redirect to `/admin`
   - Otherwise → show login form

2. **User submits credentials**
   - Authenticate with Supabase Auth
   - Check if user exists in `admins` table
   - If admin → redirect to `/admin`
   - If not admin → sign out and show error

3. **User accesses protected route**
   - Check authentication status
   - Check admin status
   - If both valid → show page
   - Otherwise → redirect to `/admin/login`

4. **Session persistence**
   - Supabase Auth handles session storage
   - On page reload, session is restored
   - Admin status is re-verified

## Usage

### Using Auth Context

```jsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { user, admin, isAdmin, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!isAdmin) return <div>Access denied</div>

  return (
    <div>
      <p>Welcome, {admin?.name}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Creating Protected Routes

```jsx
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />
</Route>
```

### Checking Admin Status

The `AuthContext` automatically checks admin status by:
1. Getting the current authenticated user
2. Querying the `admins` table for the user's ID
3. Setting `isAdmin` to `true` if found, `false` otherwise

## Admin User Creation

Admins must be created manually in Supabase:

1. **Create user in Supabase Auth**
   - Go to Authentication → Users → Add user
   - Enter email and set a password
   - Copy the user UUID

2. **Add to admins table**
   ```sql
   INSERT INTO admins (id, email, name)
   VALUES ('user-uuid-here', 'admin@example.com', 'Admin Name');
   ```

## Security Features

- ✅ **No public registration** - Registration is disabled in Supabase
- ✅ **Admin verification** - Users must exist in `admins` table
- ✅ **Automatic sign-out** - Non-admin users are signed out after login attempt
- ✅ **Protected routes** - All `/admin/*` routes require admin authentication
- ✅ **Session management** - Secure session handling via Supabase Auth

## Route Configuration

### Public Routes
- `/` - Home page
- `/teams` - Teams list
- `/teams/:teamId` - Team detail with notes

### Admin Routes (Protected)
- `/admin/login` - Login page
- `/admin` - Admin dashboard
- `/admin/teams` - Teams management
- `/admin/notes` - Notes management
- `/admin/evaluations` - Weekly evaluations

## Troubleshooting

### "Access denied" after login
- Verify the user exists in the `admins` table
- Check that the user ID matches between `auth.users` and `admins` table
- Ensure RLS policies allow reading from `admins` table

### Session not persisting
- Check browser cookies/localStorage are enabled
- Verify Supabase Auth configuration
- Check network tab for auth API calls

### Redirect loops
- Ensure `AuthContext` is properly checking admin status
- Verify `ProtectedRoute` is correctly implemented
- Check that login page doesn't redirect logged-in admins incorrectly

## Environment Variables

Make sure your `.env` file includes:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

To extend the admin system:
1. Add more admin pages in `src/pages/`
2. Create admin-specific components in `src/components/`
3. Add admin utilities in `src/utils/`
4. Extend the admin dashboard with more features

