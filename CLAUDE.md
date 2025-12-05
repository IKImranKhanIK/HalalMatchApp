# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Halal Match App is a Next.js 16 application for managing participant registrations for a halal matchmaking event. The app includes participant registration, admin authentication, and a dashboard.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0 with React Compiler enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Strict mode enabled
- **Fonts**: Geist Sans and Geist Mono (via next/font)

## Project Architecture

### App Structure

The application uses Next.js App Router with the following routes:

- `/` - Landing page (app/page.tsx)
- `/register` - Participant registration form
- `/admin/login` - Admin login page
- `/admin/dashboard` - Protected admin dashboard
- `/api/admin/login` - Admin login API endpoint

### Authentication Architecture

**Two separate admin auth systems exist** (needs consolidation):

1. **Client-side localStorage auth** (app/admin/login/page.tsx):
   - Uses hardcoded credentials: username="admin", password="password123"
   - Stores "admin_logged_in" in localStorage
   - Dashboard checks localStorage for protection

2. **API route auth** (app/api/admin/login/route.ts):
   - Uses hardcoded credentials: email="admin@halal.com", password="123456"
   - Sets httpOnly cookie "admin_auth"
   - Currently not integrated with the login page

**Important**: When implementing proper authentication, reconcile these two approaches.

### Data Storage

Currently using **localStorage** for all data persistence:
- Participant registrations stored in "registrations" key
- Admin login state stored in "admin_logged_in" key

**Note**: This is temporary. Future implementations should use a proper database.

### Registration System

Participants register with:
- Assigned number (unique, validated on submission)
- Gender (male/female)
- Full name
- Email

Numbers are stored as Numbers but validated to prevent duplicates.

## Configuration Details

### TypeScript

- Path alias: `@/*` maps to project root
- JSX mode: react-jsx (for React 19 JSX transform)
- Target: ES2017
- Strict mode enabled

### Tailwind CSS

Custom dark mode theme colors defined in tailwind.config.ts:
```typescript
dark: {
  bg: "#000",
  card: "#1f1f1f",
  border: "#333",
}
```

Dark mode uses class strategy: `darkMode: "class"`

### Next.js Configuration

- React Compiler enabled (`reactCompiler: true`)
- Uses @tailwindcss/postcss plugin for styling

## File Naming Conventions

- Route pages: `page.tsx`
- Root layout: `layout.tsx`
- API routes: `route.ts`
- Client components: Use `"use client"` directive
- Server components: Default (no directive needed)

## Important Notes

### Security Considerations

- Admin credentials are **hardcoded and insecure** - marked as TEMP in code
- localStorage-based auth is **not production-ready**
- No CSRF protection on admin login
- Secure flag is `false` on admin_auth cookie

These are temporary implementations for development and must be replaced before production deployment.

### Current Limitations

- No database integration
- No proper session management
- No password hashing
- No rate limiting or brute force protection
- Client-side only validation on registration form

## Styling Patterns

The app uses a consistent dark theme:
- Background: black (#000) or gray-900
- Cards/containers: gray-900 with rounded corners
- Borders: gray-700
- Text: white with gray-400 for secondary text
- Primary action color: green (for registration) or blue (for admin)
- Form inputs: gray-800 background with gray-700 borders
