# Project architecture

This is a React/Vite SPA and Hono Netlify Server application. Node 24 is required. Do not add a full-stack framework catch-all or broad SPA rewrite that would shadow the server.

- `src/main.jsx`: public routes, shared UI, forms, student portal and admin workspace. Bangla is default; `useApp().t(bangla, english)` selects display copy. Both languages are visible in important form labels.
- `src/data.js`: six course catalog outlines, explicitly non-orderable sample products, labels, categories and admin initial-record templates. Static outlines are presentation fallbacks; admissions require published database courses and batches.
- `src/api.js`: same-origin API client. `getUser()` refreshes Identity state; the browser sends the Identity cookie automatically.
- `src/styles.css`: Tailwind import and the institute's responsive component styles, tokens, and A4 result print stylesheet.
- `netlify/server/index.mjs`: Hono API, Identity token validation, admin role checks, transactional applications/orders, public result/certificate projections and Blob uploads.
- `db/schema.ts`, `db/index.mjs`: Drizzle relational definitions and managed Netlify Postgres adapter. JSONB stores editable entity details; foreign keys and common workflow fields are explicit columns.
- `netlify/database/migrations`: generated SQL and snapshots. Generate a named migration for every schema change.
- `public/img`: static illustrative imagery; do not describe stock photos as actual institute activities.

Use Netlify Database for durable records, Netlify Blobs for images, and Netlify Identity for authentication. Never use localStorage, process memory or repository JSON as a record database. Admin privileges come only from verified Identity `app_metadata.roles`, never user-editable fields. Public APIs must project safe result and certificate fields and enforce published/revoked status. Keep student phone numbers, addresses, parental details and private photos out of general listings. Public result photos require a published exact student/examination match.

Money is integer BDT; totals and valid discount prices are calculated on the server. Do not allow sample products to be ordered. Preserve transactional stock reservation, application seat checks, approval and unique attendance/result constraints. Grades are computed server-side, with course/batch matching and duplicate-subject checks. Attendance bulk upserts are transactional, keyed by student and date. Generated files have row-level security enabled; backend owner-role access is intentional, with no browser database client.

Run `npm run dev` for standalone frontend work or `netlify dev --port 8889` for platform emulation. Identity requires a deployment. The build pipeline validates production builds; follow current run restrictions on local build/test commands. No test suite currently exists. Review README's acceptance checklist before production use. Do not expose environment values in logs or documentation. Keep secrets out of VITE variables.
