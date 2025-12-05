# Halal Match App - Setup Guide

This guide will walk you through setting up the Halal Match Event Management System from scratch.

## ✅ Phase 1 Completed

The following has already been set up:

- ✅ All npm dependencies installed
- ✅ Database migration file created (`supabase/migrations/001_initial_schema.sql`)
- ✅ Seed data file created (`supabase/seed.sql`)
- ✅ Supabase client utilities created (`lib/supabase/`)
- ✅ Database TypeScript types created (`types/database.ts`)
- ✅ Directory structure created

## 🚀 Next Steps: Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Name**: `halal-match-app` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be provisioned

### Step 2: Run Database Migration (ONE File!)

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar
2. Click "New Query"
3. Open the file `supabase/SIMPLE_MIGRATION.sql` in your code editor
4. Copy the **ENTIRE contents** (Ctrl+A / Cmd+A to select all)
5. Paste into the Supabase SQL editor
6. Click "Run" or press `Ctrl+Enter`
7. You should see "Migration completed successfully!"

This creates:
- All database tables and indexes
- All functions and triggers
- Row Level Security policies
- Default event
- Admin user with:
  - **Email**: `admin@halalmatch.com`
  - **Password**: `admin123`
  - ⚠️ **IMPORTANT**: Change this password in production!

### Step 3: Get Your API Keys

1. In Supabase dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL**: Copy this (starts with `https://xxx.supabase.co`)
   - **Project API keys**:
     - **anon/public**: Copy this (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
     - **service_role**: Copy this (this is your `SUPABASE_SERVICE_ROLE_KEY`)
       - ⚠️ **WARNING**: Never expose the service role key in client-side code!

### Step 4: Generate Secrets

Open your terminal and run these commands to generate secure secrets:

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate JWT secret (run again for a different value)
openssl rand -base64 32
```

Save both outputs - you'll need them in the next step.

### Step 5: Create `.env.local` File

1. In your project root, create a file named `.env.local`
2. Copy the contents from `.env.example`
3. Fill in the values with:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Project URL from Step 4
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon key from Step 4
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service_role key from Step 4
   - `NEXTAUTH_SECRET`: First secret you generated in Step 5
   - `JWT_SECRET`: Second secret you generated in Step 5

Example `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-from-step-5

# Participant JWT
JWT_SECRET=your-other-generated-secret-from-step-5

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Step 6: Verify Setup

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

If everything is set up correctly, you should see the Next.js landing page without any errors in the console.

## 🔍 Troubleshooting

### "Environment variable not found" error
- Make sure `.env.local` is in the root directory (same level as `package.json`)
- Restart your dev server after creating/editing `.env.local`
- Check that variable names match exactly (case-sensitive)

### Database migration errors
- Make sure you copied the entire SQL file contents
- Check that your project is fully provisioned (green status in Supabase dashboard)
- Try running the migration again (it's safe to run multiple times)

### Can't connect to Supabase
- Verify your Project URL and API keys are correct
- Make sure you're using the correct keys (anon vs service_role)
- Check if there are any firewall/network restrictions

## 📋 Verification Checklist

Before proceeding to the next phase, verify:

- [ ] Supabase project created and provisioned
- [ ] Database migrations run successfully (check Tables in Supabase dashboard)
- [ ] Can see these tables: `events`, `participants`, `interest_selections`, `admin_users`
- [ ] Admin user exists in `admin_users` table
- [ ] `.env.local` file created with all variables filled
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] No console errors when visiting http://localhost:3000

## ✨ What's Next?

Once you've completed the setup above, I'll continue building:

1. QR code utilities
2. Shared UI components
3. Enhanced registration page with phone field and QR generation
4. Admin authentication with NextAuth
5. Participant selection interface with QR scanning
6. Admin dashboard and export functionality

---

**Need Help?** If you encounter any issues during setup, let me know and I'll help troubleshoot!
