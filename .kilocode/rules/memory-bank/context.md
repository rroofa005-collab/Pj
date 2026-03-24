# Active Context: R-Manager Pro

## Current State

**Application Status**: ✅ Fully Built - R-Manager Pro Business Management System

Full-featured business management application built with Next.js 16, SQLite (Drizzle ORM), and Tailwind CSS. Admin credentials: username `Roofa`, password `Azer123`.

## Recently Completed

- [x] Database setup with Drizzle ORM + SQLite (16 tables)
- [x] Authentication system (login page, sessions via cookies)
- [x] Role-based access control (admin / user with granular page permissions)
- [x] Login page (root route `/`) with R-Manager Pro branding and logo
- [x] Dashboard with summary cards for all modules
- [x] Workers page (العمال)
- [x] Suppliers page (الموردون)
- [x] Customer Debts page (ديون الزبائن) - auto-calculates remaining
- [x] Supplier Debts page (ديون الموردون) - auto-calculates status
- [x] Expenses page (المصاريف)
- [x] Purchased Phones page (الهواتف المشتراة)
- [x] Received Amounts page (المبالغ المستلمة)
- [x] Maintenance page (الصيانة) - auto-calculates totalCost and netProfit
- [x] Maintenance Tracking page (تتبع الصيانة) - inline status editing + combines internal/external
- [x] External Maintenance page (الصيانة الخارجية) - with technician, costs, phone status
- [x] Electronic Services page (الخدمات الإلكترونية) - dollar balance tracking
- [x] Order Tracking page (تتبع الطلبيات) - with wilaya dropdown (58 wilayas)
- [x] Installments page (الأقساط) - linked to workers
- [x] Salaries page (الرواتب) - auto-calculates net salary
- [x] Treasury page (الخزينة)
- [x] Delivery Tracking page (تتبع التوصيل)
- [x] Attendance page (الحضور والمغادرة)
- [x] Settings page - language switcher (Arabic/French/English)
- [x] Admin page - full user management with page-level permissions
- [x] Per-user access control (days and time restrictions) in Admin page
- [x] Global access control settings in Settings page
- [x] Search + date range filters on every page
- [x] Export to CSV and Clear Data buttons on every page
- [x] i18n support (Arabic, French, English) via `/src/lib/i18n.ts`
- [x] RTL/LTR layout based on language setting
- [x] RM logo as app favicon and in sidebar/login

## Current Structure

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Login page (root) |
| `src/app/LoginClient.tsx` | Login form client component |
| `src/app/actions.ts` | Server actions (auth, language) |
| `src/app/dashboard/` | All dashboard pages |
| `src/app/api/` | REST API routes for all entities |
| `src/components/AppLayout.tsx` | Sidebar + main layout |
| `src/components/PageWrapper.tsx` | Reusable CRUD table component |
| `src/db/schema.ts` | Database schema (16 tables) |
| `src/db/index.ts` | Drizzle DB client |
| `src/db/migrations/` | SQL migration files |
| `src/lib/auth.ts` | Session management, ALL_PAGES constant |
| `src/lib/i18n.ts` | Translation strings (AR/FR/EN) |
| `src/lib/apiHelper.ts` | API route helper utilities |

## Admin Credentials

- **Username**: Roofa
- **Password**: Azer123
- **Role**: admin (full access to all pages)

| Date | Changes |
|------|---------|
| 2026-03-24 | Full R-Manager Pro application built from scratch |
| 2026-03-24 | Fixed: Migrated from Bun to Node.js for better-sqlite3 compatibility; Created migrate.js with table creation + admin user setup |
| 2026-03-24 | Fixed: Admin user credentials verified (Roofa/Azer123 hash: izamy47) |
| 2026-03-24 | Added: External Maintenance page with technician, costs, phone status tracking |
| 2026-03-24 | Added: Per-user access control (days + time) in Admin page |
| 2026-03-24 | Added: Global access control settings in Settings page |
| 2026-03-24 | Updated: Maintenance tracking now shows both internal and external maintenance with badges |
