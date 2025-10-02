# 🚀 FinFlow Implementation Guide
## Complete Database & Authentication Migration

**Version:** 1.0
**Created:** 2025-10-02
**Status:** In Progress
**GitHub Repo:** https://github.com/doominikgabor/finflow.git

---

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Current State vs Target State](#current-state-vs-target-state)
3. [Prerequisites Setup](#prerequisites-setup)
4. [Database Setup](#database-setup)
5. [Authentication Implementation](#authentication-implementation)
6. [Data Migration](#data-migration)
7. [GDPR Compliance](#gdpr-compliance)
8. [Deployment](#deployment)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)
11. [Reference](#reference)

---

## Project Overview

### What We're Building
Transform FinFlow from a demo app with mock data into a production-ready financial tracker with:
- **Database**: Supabase PostgreSQL (persistent data storage)
- **Authentication**: Google OAuth (secure user login)
- **Multi-tenant**: Each user sees only their own data
- **GDPR Compliant**: Data export, deletion, privacy policy
- **Deployed**: Live on Vercel with automatic deployments
- **Cost**: €0/month for up to 40 users

### Why These Technologies?

**Supabase:**
- Open-source Firebase alternative
- PostgreSQL database (reliable, proven)
- Built-in authentication
- Row-Level Security (data isolation)
- Free tier: 500MB DB, 50k users
- Auto-backups included

**Vercel:**
- Made by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Edge network (fast globally)
- Free tier: 100GB bandwidth/month

**Google OAuth:**
- Users trust Google
- No password management
- Faster signup (1 click)
- More secure than email/password

---

## Current State vs Target State

### Current State ❌
```
User visits app
  ↓
No authentication required
  ↓
Mock data from Zustand (in-memory)
  ↓
Data lost on page refresh
  ↓
Anyone can see all data
```

### Target State ✅
```
User visits app
  ↓
Redirected to login page
  ↓
Sign in with Google
  ↓
Supabase Auth creates session
  ↓
Dashboard loads with USER'S data from database
  ↓
Data persists across sessions
  ↓
Each user isolated (RLS policies)
```

---

## Prerequisites Setup

### 1. Accounts Needed

#### Supabase Account
**URL:** https://supabase.com
**What:** Database hosting
**Cost:** Free
**Steps:**
1. Sign up with GitHub
2. Create organization: "FinFlow"
3. Create project: "finflow-production"
4. Choose region: Europe West (London) - or closest to you
5. Save database password securely
6. Wait 2-3 minutes for project creation

**Save These Credentials:**
```
Project URL: https://[your-project].supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Database Password: [your-password]
```

#### Google Cloud Account
**URL:** https://console.cloud.google.com
**What:** OAuth credentials
**Cost:** Free
**Steps:**
1. Sign in with Google
2. Create project: "FinFlow"
3. Enable OAuth consent screen (External)
4. Create OAuth credentials (Web application)
5. Add authorized origins: `http://localhost:3000`
6. Add redirect URIs: `http://localhost:3000/auth/callback`

**Save These Credentials:**
```
Client ID: 1234567890-xxxxxxxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxxxxxxxxxxxx
```

#### Vercel Account
**URL:** https://vercel.com
**What:** Hosting platform
**Cost:** Free
**Steps:**
1. Sign up with GitHub
2. Import finflow repository
3. Don't deploy yet (we'll do this later)

### 2. Local Environment Setup

**Required Software:**
- Node.js 20+ (check: `node --version`)
- Git (already installed - you're using it)
- Cursor/VS Code (you have Cursor ✓)

**Verify:**
```bash
node --version  # Should be v20.x.x or higher
git --version   # Should show git version
npm --version   # Should show npm version
```

---

## Database Setup

### 1. Database Schema

**What:** Define tables and relationships
**Why:** Structure how data is stored
**File:** Run in Supabase SQL Editor

**Tables Overview:**
- `transactions` - Income and expenses
- `budgets` - Monthly/yearly spending limits
- `subscriptions` - Recurring payments
- `user_preferences` - User settings

**Security Features:**
- Row-Level Security (RLS) enabled on all tables
- Each user can only see/modify their own data
- Automatic user_id assignment
- Cascading deletes (delete user → delete all their data)

**SQL Script Location:** See "Database Schema SQL" section below

### 2. Row-Level Security Policies

**What:** Database-level access control
**Why:** Ensure users can't see each other's data

**How it works:**
```sql
-- User makes request
SELECT * FROM transactions

-- Supabase automatically adds:
SELECT * FROM transactions WHERE user_id = auth.uid()

-- Users can ONLY see their own data!
```

**Policies Created:**
- SELECT: Users can view their own data
- INSERT: Users can create data linked to their user_id
- UPDATE: Users can modify their own data
- DELETE: Users can delete their own data

### 3. Demo Data System

**What:** Automatic sample data for new users
**Why:** Help users understand the app
**How:** Trigger runs when user signs up

**Demo Data Includes:**
- 6 sample transactions (income + expenses)
- 4 budget categories
- 4 subscription examples

**User Control:**
- Can be toggled in `user_preferences.show_demo_data`
- Future feature: "Clear demo data" button

---

## Authentication Implementation

### 1. Architecture

```
Browser (Client)
  ↓
Sign in with Google button
  ↓
Google OAuth popup
  ↓
User authorizes
  ↓
Google redirects to: /auth/callback?code=xxxxx
  ↓
Supabase exchanges code for session
  ↓
Session stored in cookies
  ↓
User redirected to /dashboard
  ↓
Middleware validates session on every request
```

### 2. File Structure

**New Files to Create:**
```
src/
├── lib/
│   └── supabase/
│       ├── client.ts          # Browser-side Supabase client
│       ├── server.ts          # Server-side Supabase client
│       └── middleware.ts      # Session management
├── hooks/
│   └── useAuth.ts             # Authentication React hook
├── app/
│   ├── login/
│   │   └── page.tsx           # Login page with Google button
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts       # OAuth callback handler
│   └── dashboard/
│       └── layout.tsx         # Protected route wrapper
└── middleware.ts              # Next.js middleware (root level)

.env.local                     # Environment variables (DO NOT COMMIT)
```

### 3. Environment Variables

**File:** `.env.local` (create in project root)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Security:**
- Never commit this file to Git
- Added to .gitignore
- Use different values for production

### 4. Google OAuth Configuration

**Supabase Side:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google
3. Paste Client ID and Client Secret from Google Cloud
4. Copy Supabase callback URL
5. Save

**Google Cloud Side:**
1. Go to APIs & Services → Credentials
2. Edit OAuth client
3. Add Supabase callback URL to "Authorized redirect URIs"
4. Save

**Callback URL Format:**
```
https://[your-project].supabase.co/auth/v1/callback
```

### 5. Protected Routes

**Middleware Strategy:**
```typescript
// middleware.ts runs on EVERY request
export async function middleware(request: NextRequest) {
  // Refresh user session
  // If session invalid → redirect to /login
  // If session valid → allow request
}
```

**Protected Paths:**
- `/dashboard/*` - Requires authentication
- `/analytics/*` - Requires authentication
- Public paths: `/`, `/login`, `/privacy`

### 6. Session Management

**Session Flow:**
```
User logs in
  ↓
Supabase creates JWT token
  ↓
Token stored in secure HTTP-only cookies
  ↓
Every request includes token
  ↓
Middleware validates token
  ↓
Token auto-refreshes before expiry
```

**Session Duration:**
- Default: 1 hour
- Auto-refresh: Extends to 7 days if active
- Idle timeout: 7 days of inactivity

---

## Data Migration

### 1. Migration Strategy

**Approach:** Gradual replacement (not big-bang)

**Why:**
- Lower risk
- Easier to debug
- Can rollback individual features
- Test each piece independently

**Steps:**
1. Create new hook (`useFinancialDataNew`) alongside old hook
2. Update components one-by-one to use new hook
3. Test each component
4. Once all working, remove old hook

### 2. Zustand → Supabase Mapping

**Old (Zustand):**
```typescript
// In-memory state
const [transactions, setTransactions] = useState([...mockData])

// Add transaction
set((state) => ({
  transactions: [...state.transactions, newTransaction]
}))
```

**New (Supabase):**
```typescript
// Database query
const { data } = await supabase
  .from('transactions')
  .select('*')

// Add transaction
const { data } = await supabase
  .from('transactions')
  .insert({ ...newTransaction, user_id: user.id })
```

### 3. Data Type Conversions

**Database → TypeScript:**
```typescript
// Dates stored as strings in database
const dbTransaction = {
  date: "2025-10-02T10:30:00Z"  // ISO string
}

// Convert to Date object for frontend
const transaction = {
  ...dbTransaction,
  date: new Date(dbTransaction.date)
}
```

**Snake Case → Camel Case:**
```typescript
// Database uses snake_case
{
  user_id: "123",
  next_billing_date: "2025-11-01",
  billing_cycle: "monthly"
}

// TypeScript uses camelCase
{
  userId: "123",
  nextBillingDate: new Date("2025-11-01"),
  billingCycle: "monthly"
}
```

### 4. Error Handling

**Strategy:** Show user-friendly messages, log technical details

```typescript
try {
  await supabase.from('transactions').insert(data)
} catch (error) {
  // Log for debugging
  console.error('Database error:', error)

  // Show to user
  toast.error('Failed to save transaction. Please try again.')
}
```

**Common Errors:**
- Network failure → "Unable to connect. Check your internet."
- Permission denied → "You don't have access to this data."
- Validation error → "Invalid amount. Please enter a positive number."

### 5. Loading States

**Pattern:** Show skeleton while loading, then real data

```typescript
const { data, loading, error } = useFinancialData()

if (loading) {
  return <SkeletonLoader />
}

if (error) {
  return <ErrorMessage message={error} />
}

return <DataTable data={data} />
```

### 6. Optimistic Updates

**What:** Update UI immediately, then sync with database

**Why:** Feels faster to users

```typescript
// 1. Update UI immediately
setTransactions([newTransaction, ...transactions])

// 2. Save to database in background
const { error } = await supabase
  .from('transactions')
  .insert(newTransaction)

// 3. If error, revert UI
if (error) {
  setTransactions(transactions.filter(t => t.id !== newTransaction.id))
  toast.error('Failed to save')
}
```

---

## GDPR Compliance

### 1. Required Features

**Right to Access:**
- Export all user data in JSON format
- Include transactions, budgets, subscriptions

**Right to be Forgotten:**
- Delete account button
- Cascading delete (all user data removed)
- 30-day grace period (soft delete)

**Right to be Informed:**
- Privacy policy page
- Clear data usage explanation
- Cookie consent

**Right to Portability:**
- Export data in machine-readable format (JSON)
- Export to Excel (already implemented)

### 2. Data Export Implementation

**Endpoint:** `/api/export-data`

**Format:**
```json
{
  "user": {
    "email": "user@example.com",
    "created_at": "2025-10-02T10:00:00Z"
  },
  "transactions": [...],
  "budgets": [...],
  "subscriptions": [...],
  "exported_at": "2025-10-02T11:00:00Z"
}
```

**Security:**
- Requires authentication
- Rate limited (1 export per hour)
- Audit logged

### 3. Account Deletion

**Process:**
1. User clicks "Delete Account"
2. Confirmation dialog (requires typing "DELETE")
3. Soft delete: Mark account as deleted, hide data
4. 30-day grace period for recovery
5. Hard delete: Permanent removal after 30 days

**Database:**
```sql
-- Soft delete
UPDATE auth.users SET deleted_at = NOW() WHERE id = user_id;

-- Hard delete (after 30 days)
DELETE FROM auth.users WHERE id = user_id;
-- Cascades to all user data automatically
```

### 4. Privacy Policy

**Required Sections:**
- What data we collect (email, financial transactions)
- How we use it (app functionality only)
- Where it's stored (Supabase, EU servers)
- How long we keep it (until user deletes account)
- User rights (access, delete, export)
- Cookie usage (authentication only)
- Email usage (updates, promotions - with opt-in)
- Contact information

**Template:** See "Privacy Policy Template" section below

### 5. Cookie Consent

**Implementation:** Simple banner

```
🍪 We use cookies to keep you logged in.
[Accept] [Learn More]
```

**Cookies Used:**
- `sb-access-token` - Authentication (required)
- `sb-refresh-token` - Session refresh (required)

**No tracking cookies:**
- No Google Analytics
- No Facebook Pixel
- No third-party marketing

---

## Deployment

### 1. Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Authentication works
- [ ] Database queries work
- [ ] No console errors
- [ ] Environment variables documented
- [ ] .env.local added to .gitignore

### 2. Production URLs

**Update in Google Cloud:**
1. Add: `https://finflow.vercel.app` to authorized origins
2. Add: `https://finflow.vercel.app/auth/callback` to redirect URIs

**Update in Supabase:**
- Authentication → URL Configuration
- Add: `https://finflow.vercel.app` to allowed redirect URLs

### 3. Vercel Deployment

**Steps:**
1. Go to Vercel dashboard
2. Import GitHub repository
3. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   NEXT_PUBLIC_APP_URL=https://finflow.vercel.app
   ```
4. Deploy!

**Automatic Deployments:**
- Every push to `main` → production
- Every pull request → preview deployment
- Rollback available in one click

### 4. Post-Deployment Verification

**Test Checklist:**
- [ ] Visit https://finflow.vercel.app
- [ ] Login with Google works
- [ ] Create transaction
- [ ] Refresh page (data persists)
- [ ] Logout and login (data still there)
- [ ] Export data works
- [ ] Privacy policy accessible

---

## Monitoring & Maintenance

### 1. Usage Monitoring

**Supabase Dashboard:**
- Database size (track toward 500MB limit)
- Monthly Active Users (track toward 50k limit)
- API requests (track toward 500k/month limit)

**Vercel Dashboard:**
- Bandwidth usage (track toward 100GB limit)
- Function invocations
- Error rate

**Set Alerts:**
- Email when 80% of any limit reached
- Weekly usage report

### 2. Backup Strategy

**Automatic (Supabase):**
- Daily backups (last 7 days retained on free tier)
- Point-in-time recovery available
- Stored in multiple availability zones

**Manual Weekly Backups:**

Script: `scripts/backup-data.sh`
```bash
#!/bin/bash
# Download all database tables as CSV
# Requires: SUPABASE_ACCESS_TOKEN

DATE=$(date +%Y-%m-%d)
mkdir -p backups/$DATE

# Export each table
supabase db dump --data-only > backups/$DATE/data.sql
echo "Backup created: backups/$DATE/data.sql"
```

**Run weekly:**
```bash
npm run backup-data
```

### 3. Error Tracking

**Client Errors:**
- Log to browser console (development)
- Send to error tracking service (production - optional)

**Server Errors:**
- Logged in Vercel dashboard
- Email alerts for critical errors

**Database Errors:**
- Logged in Supabase dashboard
- Auto-retry for transient failures

### 4. Performance Monitoring

**Key Metrics:**
- Page load time (<3 seconds)
- Time to interactive (<5 seconds)
- Database query time (<500ms)

**Optimization:**
- Database indexes on frequently queried columns
- Lazy loading for charts
- Image optimization (Vercel automatic)

---

## Troubleshooting

### Common Issues

#### "Invalid API key"
**Cause:** Wrong Supabase credentials
**Fix:**
1. Check `.env.local` has correct values
2. Restart dev server: `npm run dev`
3. Verify keys in Supabase dashboard → Settings → API

#### "User not authenticated"
**Cause:** Session expired or cookies blocked
**Fix:**
1. Logout and login again
2. Check browser allows cookies
3. Clear browser cache
4. Verify middleware is running

#### "Permission denied for table"
**Cause:** Row-Level Security policies not configured
**Fix:**
1. Verify RLS enabled on table
2. Check policies exist for all operations (SELECT, INSERT, UPDATE, DELETE)
3. Test with Supabase SQL query: `SELECT * FROM transactions`

#### "Data not persisting"
**Cause:** Still using old Zustand hook
**Fix:**
1. Verify component uses `useFinancialDataNew` not `useFinancialData`
2. Check database contains data: Supabase → Table Editor
3. Verify user_id is set correctly

#### "Callback URL mismatch"
**Cause:** Google OAuth redirect URL not configured
**Fix:**
1. Google Cloud: Add exact callback URL
2. Supabase: Add exact site URL
3. URLs must match exactly (including https://)

### Debug Mode

**Enable verbose logging:**
```typescript
// src/lib/supabase/client.ts
export const supabase = createClient(url, key, {
  auth: {
    debug: true  // Add this
  }
})
```

**Check session:**
```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)
```

---

## Reference

### Database Schema SQL

```sql
-- [Full SQL from earlier in this document]
-- See "Database Setup" section above
```

### Privacy Policy Template

```markdown
# Privacy Policy for FinFlow

**Last Updated:** October 2, 2025

## Introduction
FinFlow ("we", "our", "us") respects your privacy. This policy explains how we collect, use, and protect your personal data.

## Data We Collect
- **Email address** (from Google OAuth)
- **Financial transactions** (amount, category, description, date)
- **Budget information** (categories, limits)
- **Subscription data** (names, costs, billing dates)

## How We Use Your Data
- Provide app functionality (tracking finances)
- Sync data across your devices
- Send important updates (with your permission)
- Improve app performance

## Where We Store Data
- **Database:** Supabase (EU servers, Frankfurt)
- **Hosting:** Vercel (Edge network)
- **Backups:** Supabase automated backups (EU)

## Data Retention
- Active accounts: Indefinitely
- Deleted accounts: 30-day grace period, then permanently deleted

## Your Rights (GDPR)
You have the right to:
- **Access** your data (export feature)
- **Delete** your data (account deletion)
- **Portability** (download JSON/Excel)
- **Opt-out** of promotional emails

## Security Measures
- Encrypted connections (HTTPS/TLS)
- Row-level security (user data isolation)
- Google OAuth (secure authentication)
- Regular security updates

## Cookies
We use essential cookies only:
- `sb-access-token` - Keep you logged in
- `sb-refresh-token` - Refresh your session

No tracking or marketing cookies.

## Email Communications
With your consent, we may email you:
- Important app updates
- New features
- Tips for using FinFlow

Opt-out anytime via email preferences.

## Third Parties
We share data with:
- **Supabase** (database hosting)
- **Vercel** (web hosting)
- **Google** (authentication only)

We never sell your data.

## Changes to Policy
We'll notify you of major changes via email.

## Contact Us
Questions? Email: [your-email@example.com]

---

By using FinFlow, you agree to this privacy policy.
```

### Cookie Consent Banner

```typescript
// src/components/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm">
          🍪 We use cookies to keep you logged in and improve your experience.
          <a href="/privacy" className="underline ml-1">Learn more</a>
        </p>
        <Button onClick={accept} variant="secondary">
          Accept
        </Button>
      </div>
    </div>
  )
}
```

### Environment Variables Reference

**Development (`.env.local`):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_APP_URL=https://finflow.vercel.app
```

### Useful Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Check code quality

# Database
npm run backup-data      # Manual backup (after script created)

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit with message
git push origin main     # Push to GitHub

# Deployment
git push origin main     # Auto-deploys to Vercel

# Rollback
git revert <commit-hash> # Undo specific commit
git push origin main     # Deploy rollback
```

### Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    // ... existing dependencies
  }
}
```

---

## Implementation Checklist

### Phase 1: Setup ✅
- [x] Create backup branch
- [ ] Create Supabase account
- [ ] Setup Google OAuth
- [ ] Create Vercel account
- [ ] Create database schema

### Phase 2: Authentication 🔄
- [ ] Install Supabase packages
- [ ] Create environment variables
- [ ] Create Supabase clients
- [ ] Create auth middleware
- [ ] Create auth hook
- [ ] Create login page
- [ ] Protect dashboard routes
- [ ] Test auth flow

### Phase 3: Data Migration 🔄
- [ ] Create new database hook
- [ ] Migrate transactions
- [ ] Migrate budgets
- [ ] Migrate subscriptions
- [ ] Remove old Zustand hook
- [ ] Test all CRUD operations

### Phase 4: GDPR 🔄
- [ ] Add data export
- [ ] Add account deletion
- [ ] Create privacy policy
- [ ] Add cookie consent

### Phase 5: Deploy 🔄
- [ ] Update OAuth URLs
- [ ] Configure Vercel
- [ ] Deploy to production
- [ ] Test live site

### Phase 6: Monitor 🔄
- [ ] Setup usage alerts
- [ ] Create backup script
- [ ] Document for users

---

## Progress Tracker

**Current Status:** Phase 1 - Safety backup created ✅

**Last Updated:** 2025-10-02

**Next Step:** Commit current changes, then create Supabase database schema

---

**Notes:** This document is the single source of truth for the migration. Reference it throughout implementation. Update checklist as you complete tasks.
