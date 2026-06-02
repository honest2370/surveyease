# SurveyEase - Complete Setup Guide

## Your Credentials (from screenshots)
- **RapidoReach App ID**: `B4RkqLUuAFf`
- **RapidoReach App Key**: `0cf62256a0c4eb5ea5b0ec5db690e5cf`
- **RapidoReach App Secret**: `b95892f5497255ca5edaad340fee54ff`
- **Supabase URL**: `https://gavgtimgjwdtioonziwy.supabase.co`
- **Supabase Publishable Key**: `sb_publishable_c3Bd-OSyB6F0E78mHEx0QA_qlAuhEjl`
- **Vercel Project URL**: `https://surveyease.vercel.app`
- **Virtual Currency**: C-N (1000 C-N = $1.00 USD)

---

## Step 1: Create Next.js Project

```bash
npx create-next-app@latest surveyease --typescript --tailwind --app --src-dir
cd surveyease
npm install @prisma/client prisma @supabase/supabase-js @supabase/ssr
npm install next-auth bcryptjs jose
npm install @types/bcryptjs
npm install lucide-react class-variance-authority clsx tailwind-merge
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge table tabs dialog input label
npx prisma init
```

---

## Step 2: Vercel Environment Variables
Set these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
DATABASE_URL="postgresql://postgres:[YOUR-SUPABASE-DB-PASSWORD]@db.gavgtimgjwdtioonziwy.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-SUPABASE-DB-PASSWORD]@db.gavgtimgjwdtioonziwy.supabase.co:5432/postgres"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://surveyease.vercel.app"
SUPABASE_URL="https://gavgtimgjwdtioonziwy.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_c3Bd-OSyB6F0E78mHEx0QA_qlAuhEjl"
RAPIDOREACH_APP_ID="B4RkqLUuAFf"
RAPIDOREACH_APP_KEY="0cf62256a0c4eb5ea5b0ec5db690e5cf"
RAPIDOREACH_APP_SECRET="b95892f5497255ca5edaad340fee54ff"
SURVEY_SECRET_KEY="b95892f5497255ca5edaad340fee54ff"
NEXT_PUBLIC_RAPIDOREACH_APP_ID="B4RkqLUuAFf"
NEXT_PUBLIC_APP_URL="https://surveyease.vercel.app"
```

> **Get Supabase DB Password**: Go to supabase.com → Project → Settings → Database → Connection string → copy the password.

---

## Step 3: RapidoReach Dashboard Settings

### Callback Tab:
- **Callback URL**: `https://surveyease.vercel.app/api/webhooks/survey-callback`
- **Callback Option**: Server-side ✅
- **Whitelist IPs**: Already shown in your screenshot

### App Settings Tab:
- **Screenout Reward**: 10 (already set)
- **Maximum LOI**: 10 (already set)
- Click **Request To Go Live** once testing is verified ✅

### Virtual Currency Tab (already configured):
- App Name: Surveyease ✅
- Virtual Currency Name: C-N ✅
- Virtual Currency Value: 1000 ✅
- App Store URL: surveyease.vercel.app ✅

---

## Step 4: Deploy to Vercel

```bash
git init
git add .
git commit -m "Initial SurveyEase setup"
vercel --prod
```

Or connect your GitHub repo in Vercel Dashboard.

---

## File Structure
```
surveyease/
├── prisma/
│   └── schema.prisma          ← Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── webhooks/survey-callback/route.ts   ← Postback handler
│   │   │   ├── user/transactions/route.ts
│   │   │   ├── user/profile/route.ts
│   │   │   └── dev/simulate-postback/route.ts      ← Testing endpoint
│   │   ├── dashboard/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── StatsSection.tsx
│   │   │   ├── SurveyWall.tsx
│   │   │   ├── TransactionTable.tsx
│   │   │   └── DevTestPanel.tsx
│   │   └── ui/  (shadcn components)
│   └── lib/
│       ├── prisma.ts
│       ├── auth.ts
│       ├── hmac.ts             ← Signature validation
│       └── points.ts           ← Points allocation logic
```
