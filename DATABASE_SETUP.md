# Database Setup Quick Guide

## Quick Start

1. **Set up Supabase project**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings → API

2. **Configure environment variables**
   - Create `.env` file in the root directory:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Run database migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_rls_policies.sql`

4. **Disable public registration**
   - Go to Authentication → Settings → Email
   - Toggle OFF "Enable email signup"

5. **Create your first admin**
   - Create a user via Supabase Dashboard (Authentication → Users → Add user)
   - Copy the user UUID
   - Run in SQL Editor:
     ```sql
     INSERT INTO admins (id, email, name)
     VALUES ('user-uuid-here', 'admin@example.com', 'Admin Name');
     ```

## File Structure

```
uit/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql    # Tables and indexes
│   │   ├── 002_rls_policies.sql      # Security policies
│   │   └── 003_disable_auth_registration.sql  # Documentation
│   └── README.md                      # Detailed documentation
├── src/
│   ├── lib/
│   │   ├── supabase.js               # Supabase client (JS)
│   │   └── supabase.ts               # Supabase client (TS)
│   ├── types/
│   │   ├── database.types.ts          # TypeScript types
│   │   └── database.types.js         # JSDoc types
│   ├── utils/
│   │   ├── admin.ts                  # Admin utilities (TS)
│   │   └── admin.js                  # Admin utilities (JS)
│   └── hooks/
│       ├── useAdmin.js               # Admin status hook
│       ├── useTeams.js               # Teams data hook
│       ├── useNotes.js               # Notes data hook
│       └── useWeeklyEvaluations.js   # Evaluations data hook
└── DATABASE_SETUP.md                 # This file
```

## Key Features

✅ **Public Read Access** - Anyone can read all data  
✅ **Admin Write Access** - Only admins can create/update/delete  
✅ **Anonymous Notes** - Public can create notes without authentication  
✅ **Secure RLS Policies** - Row-level security enforced  
✅ **Type Safety** - TypeScript types included  

## Usage Examples

See `supabase/README.md` for detailed usage examples and API documentation.

