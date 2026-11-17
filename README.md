# Computer DB-IT Village

A Bangla-first, responsive website and administration workspace for a computer training institute, retail shop and servicing center in Freeport, Chattogram. English is available through the language switch.

## Technologies and hosting

React 19, Vite, Tailwind CSS 4, Lucide icons, Hono on Netlify Server, Netlify Database (Postgres) with Drizzle, Netlify Identity, and Netlify Blobs. The deployment environment requires these Netlify services in place of the requested Supabase services. There is no Supabase dependency or Supabase credential requirement. SQL migrations are supplied under `netlify/database/migrations`; these target the managed Postgres database, not Supabase Auth or Storage.

## Local development

Install Node 24 and run `npm install`. Link the project with the Netlify CLI, then run `netlify dev --port 8889` for frontend and backend emulation. Plain `npm run dev` serves the frontend only. Netlify Identity login requires the deployed site; it is not emulated locally. `npm run build` is the production build command. The automated deployment pipeline runs the build.

Netlify supplies Database, Blobs and runtime credentials. Do not add credentials to browser code or VITE-prefixed variables. `.env.example` documents this setup. `URL` is the platform-provided public production origin and is used to verify Identity sessions.

## Deploy

Connect this repository to Netlify. The supplied configuration publishes `dist`, uses Node 24, detects `netlify/server/index.mjs`, and routes `/api/*` to the server. Only `/app/*` is rewritten to the SPA, so API requests are not intercepted by a catch-all rewrite. Netlify applies Drizzle migrations during deployment. Image CDN resizes the local hero photograph.

When changing the schema, edit `db/schema.ts`, then run `npx drizzle-kit generate --name descriptive_change`. Commit generated migrations with the schema. All database tables enable row-level security. Browsers never connect directly to Postgres: only the trusted backend database role accesses records, and server routes enforce application permissions. Non-owner database roles have no row policies granting direct access. Do not give the browser the owner connection or add broad SQL policies.

## First administrator

Identity has been enabled for this site. In the Netlify project dashboard, open Identity, invite your administrator email, and assign the server-controlled `admin` role to that user. Follow the invitation link and set a password in `/app/admin`. Invitation and recovery callbacks are handled by the application. Change registration to invite-only if desired. Being registered never grants administrator access; user-editable metadata cannot grant roles.

The first administrator must be invited and assigned their role by the project owner. No default password or automatic privilege escalation exists.

## Content setup

1. Sign in at `/app/admin`. Select **Add initial courses as drafts** to create the six requested courses. Existing course IDs are preserved. Edit fees, duration, schedule, requirements, certificate terms, descriptions and syllabus, then publish courses.
2. Create batches with a unique ID, linked course, start date, schedule and seat capacity. Publish them to open applications. Pending and approved applications reserve seats; rejected applications release seats.
3. Upload institute photographs in Gallery and choose the category. Catalog and gallery uploads are public; admission student photos are private. Images may also use HTTPS URLs. Homepage stock photographs are explicitly illustrative, and sample products have no invented prices or ordering capability.
4. Add real products, brands, categories, images, prices in whole BDT and stock counts. An optional discount price is charged when lower than the regular price. Publish only confirmed business listings.
5. Add notices and publish them. Website Settings uses the ID `website` for the share title and description. No accreditation or placement claims have been invented.

## Operations

- **Admissions:** Applications are stored only after backend validation and a database write. Approve a pending application using the Approve action and assign a unique student ID. Reject using the editor. Student creation and approval are transactional.
- **Students:** Manage profiles, course/batch, start/end dates and lifecycle status. Set `userId` to their Netlify Identity user ID to link the private student portal. A student sees only their linked profile and attendance.
- **Attendance:** Use Mark batch attendance to select a course, batch and date, then mark each active student Present or Absent and save the roster transactionally. Individual records can also be added. The database enforces one record per student per day. Filter by course, batch, student and month; export a CSV report. Edit an existing row to correct attendance.
- **Examinations:** Create a linked course/batch examination and subject records. Add results for a student and examination. Selecting an examination loads its configured subjects into a labeled marks-entry table. Add or edit each subject’s total, pass and obtained marks. The stored result marks array contains `{ "subject": "Theory", "obtained": 65, "total": 100, "pass": 40 }`. The server calculates totals, percentage, grade and pass/fail. Course syllabuses use one topic per line and results use a subject-wise marks table. Other structured JSON fields use a validated text editor; invalid JSON blocks saving. Publish only reviewed results.
- **Grades:** A+ ≥80, A ≥70, A− ≥60, B ≥50, C ≥40, D below 40. F if any subject is below its pass mark. This is the application's explicit default grading policy and should be reviewed by the institute before publishing results.
- **Public results:** Search requires exact student and examination IDs. Unpublished results return no data. Public responses contain only the result-card fields. A photo is available only when that student/examination has a published result. Print uses an A4 stylesheet; Download PDF captures the result card and generates an A4 PDF in the browser.
- **Certificates:** Use a unique certificate ID, linked student, completion date and Verified status. Publish to make it searchable. Set status to Revoked or unpublish to remove public verification.
- **Orders:** Server recalculates totals from current product prices and reserves stock inside a transaction. Cash on Delivery is recorded. Staff review customer details and line items and update status. Cancelling an order does not automatically return inventory; review and adjust stock explicitly. Delivery charges and dates are confirmed by phone. No payment processing is claimed.
- **Servicing:** Review customer/device information and update Pending, Received, In Progress, Completed or Cancelled.

Record IDs and relational links are visible in the admin interface. Foreign keys prevent deleting referenced records; unpublish historical records instead. Syllabus topics, subject marks, gallery categories and notice categories have dedicated controls; remaining structured metadata can use JSON.

## Verification and remaining operational checks

Dependencies were installed, Identity was activated and database migrations were generated. Source was reviewed. This run did not execute a build, development server or automated tests because the deployment environment performs build validation separately. Successful deployment, database writes, invited-admin login, permissions, public/private result behavior, print/PDF output, mobile layouts, admission uploads, checkout stock races and service submissions must be acceptance-tested on the deployed site before live admissions or sales. No live student records, fake results, fabricated testimonials or confirmed business prices were seeded.

The admin table currently loads up to 1,000 records per module and public listings up to 100. Add server pagination before exceeding those limits. Public intake endpoints validate inputs and file signatures and impose request size limits; configure site-level traffic controls for abuse prevention before a large public launch. Student photographs uploaded before an abandoned application are retained; implement a retention/cleanup policy appropriate to institute operations.
