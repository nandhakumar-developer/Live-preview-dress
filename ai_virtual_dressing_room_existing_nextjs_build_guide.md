# AI Virtual Dressing Room — Existing Next.js Project Build Guide
## Instructions for Claude Code / Antigravity

> **Project status:** Next.js is already installed and the project has already been created. Work inside the existing repository. Do not recreate the project, run `create-next-app`, overwrite working configuration, or start with a static mockup.

---

## 1. Your task

Act as a senior full-stack engineer and product designer. Inspect the existing repository, then implement a working AI Virtual Dressing Room for a physical clothing shop. The app will run on a Windows PC connected to a webcam and a large touchscreen or smart-mirror display.

A customer should be able to:

1. Open the kiosk without logging in.
2. Start the camera after granting permission and align themselves with an on-screen body-position guide.
3. Adjust framing where supported and lock the selected framing settings.
4. Browse published garments by category.
5. Select a garment and see a real-time AI try-on stream when Decart credentials and credits are available.
6. Change garments during the same AI session where the current SDK supports it.
7. Record up to 30 seconds of the **AI-transformed video**, stop recording, replay it, and delete it.
8. End/reset the session. The app must stop the camera and AI stream and clear temporary recordings.

An authenticated admin should be able to:

- Sign in using **Supabase Auth**.
- Add, edit, publish/unpublish, feature, and delete garments.
- Upload garment images to **Supabase Storage**.
- Replace or delete uploaded images safely.
- Manage categories such as Women, Men, Kids, Sarees, Dresses, Shirts, and Kurtis.
- Set which products appear in the kiosk, with no more than five garment cards visible at once.
- See upload progress, validation messages, and delete confirmation.
- Make catalogue changes that appear on the customer kiosk without redeploying the app.

**Build the actual application, not just a plan.** If an external AI key is missing, the rest of the application must still work in a clearly labelled demo mode. Never pretend a mock stream is live AI.

---

## 2. First action: inspect the existing project

Before changing code:

1. List and inspect the repository files, `package.json`, Next.js version, App Router or Pages Router setup, TypeScript configuration, Tailwind setup, lint configuration, and existing components.
2. Identify which dependencies are already installed.
3. Preserve the current package manager and lockfile (`package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`).
4. Do not overwrite existing routes or styling without understanding them.
5. Make a short implementation checklist, then begin coding in phases.
6. Run the existing app and baseline lint/type checks if available.
7. Add only the missing dependencies. Do not reinstall or scaffold Next.js.

If this is an App Router project, use the App Router. If the existing project uses another structure, adapt to it rather than destructively converting it.

---

## 3. Recommended implementation stack

Reuse existing compatible dependencies first. Add only what is missing.

- **Framework:** existing Next.js + React + TypeScript project.
- **UI:** existing Tailwind CSS; shadcn/ui if already configured or straightforward to add; Lucide React icons.
- **Motion:** Framer Motion only if useful and compatible; respect reduced-motion preferences.
- **Backend:** Supabase Postgres, Supabase Auth, Supabase Storage, Row Level Security (RLS).
- **Supabase integration:** `@supabase/supabase-js` and `@supabase/ssr` for cookie-aware server/browser clients.
- **Validation:** Zod for server inputs and product forms.
- **AI:** `@decartai/sdk`, after verifying the current official API and installed SDK types.
- **Camera:** `navigator.mediaDevices.getUserMedia`.
- **Recording:** browser `MediaRecorder` on the transformed output stream, with MIME-type capability checks.
- **Testing:** use the repository’s existing test setup; add focused tests if no test framework exists and time permits.

Do not add a separate backend framework. Use Next.js Server Components, Server Actions or Route Handlers where appropriate, and Supabase for auth/data/storage.

---

## 4. Main routes

Use these routes unless existing project conventions suggest an equivalent structure.

### Customer kiosk

- `/` — redirect to `/kiosk` or render the kiosk.
- `/kiosk` — full-screen, touch-first customer experience.
- No customer account required.

### Admin

- `/admin/login` — Supabase email/password sign-in.
- `/admin` — overview with product/category counts and quick actions.
- `/admin/products` — searchable/filterable product list.
- `/admin/products/new` — create product and upload image.
- `/admin/products/[id]` — edit product and replace/remove image.
- `/admin/categories` — category CRUD.
- `/admin/settings` — shop name, featured products, session duration and recording policy.

Protect every admin page **and every mutation endpoint** with server-side authorization. Hiding admin buttons in the UI is not security.

---

## 5. Supabase setup — authentication, database and image storage

### 5.1 Environment variables

Create `.env.example` with placeholders only:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only; never expose with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=

# Server-only Decart key
DECART_API_KEY=
```

Use the public Supabase anon/publishable key for normal browser/server clients with RLS. Prefer normal authenticated user-scoped clients for admin operations. Use the service-role key only in tightly controlled server-only code when genuinely necessary. Never import it into client components, expose it in a browser bundle, commit real secrets, or log them.

Ensure `.gitignore` ignores `.env*` while allowing `.env.example`.

### 5.2 Supabase client utilities

Create utilities suitable for the installed Next.js version, for example:

- `lib/supabase/client.ts` — browser client.
- `lib/supabase/server.ts` — cookie-aware server client using `@supabase/ssr`.
- `lib/supabase/admin.ts` — optional service-role client, server-only and used sparingly.
- `lib/auth/require-admin.ts` — reusable server-side admin guard.

Follow the current official Supabase Next.js SSR guide. Handle refreshed auth cookies correctly. Do not rely on a client-side `localStorage` check alone to protect admin routes.

### 5.3 Admin authorization model

Use Supabase Auth for login and a separate `admin_users` table to grant admin access.

Suggested table:

- `user_id uuid primary key references auth.users(id) on delete cascade`
- `created_at timestamptz not null default now()`

Only a trusted project owner should add the first admin user to this table through the Supabase dashboard or a controlled SQL operation. **Never allow users to self-assign admin status.**

For each protected server operation:

1. Read the authenticated user from the server-side Supabase session.
2. Confirm the user exists in `admin_users`.
3. Reject unauthenticated/non-admin requests with an appropriate redirect or `401/403`.
4. Apply RLS as a second security layer.

Do not trust user IDs, role values, or `is_admin` values supplied by the browser.

### 5.4 Database schema and migration

Create SQL migrations in the repository, e.g. `supabase/migrations/0001_initial_schema.sql`.

Create these tables:

**`admin_users`**
- `user_id uuid primary key references auth.users(id) on delete cascade`
- `created_at timestamptz default now()`

**`categories`**
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text unique not null`
- `audience text` — women, men, kids, unisex, or other configured audience
- `sort_order integer not null default 0`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

**`products`**
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `sku text unique`
- `category_id uuid references categories(id) on delete set null`
- `description text`
- `price numeric`
- `currency text not null default 'INR'`
- `garment_type text not null`
- `color text`
- `image_path text not null`
- `thumbnail_path text`
- `try_on_prompt text`
- `is_published boolean not null default false`
- `is_featured boolean not null default false`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

**`kiosk_settings`**
- `id uuid primary key default gen_random_uuid()`
- `shop_name text not null default 'Virtual Dressing Room'`
- `logo_path text`
- `preview_seconds integer not null default 30`
- `recording_enabled boolean not null default true`
- `idle_timeout_seconds integer not null default 60`
- `updated_at timestamptz not null default now()`

Add useful indexes for published products, category filtering, sort order, and featured products. Add an `updated_at` trigger where appropriate. Add seed SQL for the default categories and initial settings; do not insert pretend products into the live database unless clearly labelled as sample data.

### 5.5 RLS policy requirements

Enable RLS on all application tables. Write explicit policies and test them.

- Anonymous/customer users can read only active categories and published products.
- Anonymous users cannot insert, update, publish, or delete products/categories/settings.
- Only authenticated users present in `admin_users` can manage catalogue and settings data.
- Do not let a normal authenticated user become an admin by updating their own profile.
- The server must still perform an admin check before privileged mutations.

Keep the public kiosk read path narrow. Never return private admin-only data to the kiosk.

### 5.6 Supabase Storage

Create a bucket named `garment-images`.

Recommended object paths:

`products/<product-uuid>/<unique-file-name>.<extension>`

Use public read access only if the bucket is intended to serve published garment photos publicly. Otherwise use signed URLs. In either case, upload/update/delete permissions must be restricted to authorized admins through Storage policies and server-side checks.

Accept JPEG, PNG, and WebP only. Set a reasonable configurable maximum file size (start at 8 MB). Validate extension, MIME type, and size; do not trust only the filename. Show upload progress and errors. Use unique filenames so replacing a photo does not accidentally overwrite another product’s image.

Store the **storage object path** in `products.image_path`, not only a hard-coded external URL. Generate the public/signed URL from the path when rendering the image.

**Image replacement flow:**
1. Validate the new file.
2. Upload the new file.
3. Update the product record to point to the new object.
4. Only after the database update succeeds, remove the old object if no other record references it.
5. If the database update fails, clean up the new orphaned object and keep the old image intact.

**Product deletion flow:**
1. Require admin authentication and server-side authorization.
2. Ask for confirmation in the UI.
3. Delete the product record safely.
4. Remove the associated storage object only after verifying it is not referenced elsewhere.
5. If storage cleanup fails, report it and log a safe cleanup task rather than silently claiming complete deletion.

Never allow anonymous visitors to upload or delete product images. Do not put the service-role key in client code.

---

## 6. Admin UI and product management

Design the admin area for practical daily use, not like the customer kiosk.

### Product list

Include:
- Product thumbnail, name, SKU, category, price, publish status and featured status.
- Search by name/SKU.
- Filters for category and publication state.
- Pagination if needed.
- Actions: Edit, Publish/Unpublish, Feature/Unfeature, Delete.
- Clear empty, loading, error, and success states.

### Add/edit product form

Fields:
- Product name (required).
- SKU (optional).
- Category (required).
- Description (optional).
- Price (optional; INR by default).
- Garment type (required).
- Colour (optional).
- Garment image (required when creating).
- AI try-on prompt/description (optional; otherwise build a safe prompt from product metadata).
- Published toggle.
- Featured toggle.

Image upload should include:
- Drag/drop and browse file controls.
- Image preview.
- File type and size validation.
- Upload progress/status.
- Replace image and remove image actions.
- Accessible errors and success feedback.

Recommend a clear, front-facing photo with the whole garment visible, good lighting, and a plain background. Avoid folded/cropped garments and cluttered backgrounds.

### Five-product display rule

Admin may manage any number of products, but the kiosk selection area must display **no more than five products at once**. If a category has more than five published products, use paging or a “More” interaction that still renders a maximum of five cards on the current page. Admin can choose featured products, with server-side validation to enforce a maximum of five featured products per category if that is the selected business rule.

Changes must appear on the kiosk without redeploying. Fetch current published products on category changes and when returning from idle. Supabase Realtime is optional; if used, also provide a refetch fallback and ensure unpublished/deleted products cannot remain selectable.

---

## 7. Customer kiosk design

Create a premium fashion-tech interface for a 16:9 landscape touchscreen. It should adapt to 4K, 1080p, 1366×768, tablets, and smaller screens.

### Visual direction

- Background: warm off-white `#F7F5F1` or clean white.
- Main text: `#171717`.
- Muted text: `#737373`.
- Accent: deep burgundy `#7A1F2B` or warm rust `#B4533C`.
- Borders: `#E7E2DC`.
- Generous spacing, editorial typography, clean product photos, subtle shadows, refined 12–20px radii.
- Avoid blue/purple gradients, clutter, excessive glassmorphism, emoji, and unnecessary animation.
- Use Lucide icons and clear, large touch controls (at least 48 CSS px; larger where practical).
- Keep the camera/AI preview as the main visual focus.
- Respect `prefers-reduced-motion`.

### Screen states

1. **Welcome / positioning:** Start Camera button, brief camera consent, body alignment guide.
2. **Camera alignment:** live local webcam preview and positioning controls.
3. **Garment selection:** categories and up to five garment cards visible at once.
4. **AI preview:** transformed output, selected garment, remaining timer, Change Outfit, Record, End Session.
5. **Recording:** obvious recording indicator and timer; show a short consent notice before recording.
6. **Playback:** replay the captured clip or delete it.
7. **Error/recovery:** camera denied, AI unavailable, no credits, network loss, unsupported recording, empty catalogue.
8. **Session ended/reset:** release camera/AI resources and return to welcome/selection state.

Always show truthful status. If Decart is not connected, show **“Demo mode — AI not connected”**. Do not use a simulated filter and label it as AI.

### Camera framing and lock

- Ask for camera permission only after the customer taps Start Camera.
- Display a live local preview and a simple body-position silhouette/guide.
- Support mirror preview and fit/crop selection.
- Add zoom/crop controls only if they can be implemented without breaking the model’s expected input.
- “Lock position” locks the selected framing/crop/zoom settings in app state. It does not freeze the person or track their body physically.
- Check the current Decart digital-mirror example for required stream dimensions/aspect ratio and portrait/landscape cropping.
- Do not reconnect the AI session for every garment if the current SDK supports updating the garment in-session.

---

## 8. Real-time AI try-on integration

Use Decart Lucy V-TON through the official JavaScript SDK. First verify current docs and types from:

- https://github.com/DecartAI/tryon-examples
- https://github.com/DecartAI/tryon-examples/tree/main/examples/digital-mirror
- https://github.com/DecartAI/tryon-examples/tree/main/examples/standalone
- https://github.com/DecartAI/sdk
- https://docs.platform.decart.ai/sdks/javascript
- https://platform.decart.ai/models/lucy-vton

Do not assume old snippets are still valid. Confirm the current model identifier, token flow, connection lifecycle, garment update API, and remote-stream callback.

### Secret handling

- Keep `DECART_API_KEY` server-side only.
- Create a protected Next.js Route Handler that issues a short-lived Decart client token using the official SDK.
- The browser should request a short-lived token from that route; it must never receive the permanent API key.
- Validate configuration and rate-limit token creation where practical.
- Do not log keys, client tokens, or video.
- If the key is missing, AI connection fails, or credits are exhausted, display a clear error and keep non-AI parts of the app usable.

### Connection lifecycle

Create a reusable hook or service, such as `useVirtualTryOn`, with explicit states:

`idle → requesting-camera → camera-ready → connecting-ai → ai-ready → recording → stopping → ended/error`

Requirements:
- Acquire camera stream only after a user gesture.
- Connect using the current official Decart SDK API.
- Render the **remote/transformed stream** in the primary preview.
- Do not display the raw camera stream as if it were transformed AI output.
- Update the garment using the current documented SDK method without reconnecting, if supported.
- Handle permission denial, device not found, network loss, provider errors, token failures, and browser unmount.
- On every exit/error/timeout: stop recording if active, disconnect the AI client, stop all camera tracks, clear timers/listeners, revoke object URLs, and reset state.
- Use a single cleanup function that is safe to call more than once.
- If using a mirror effect, ensure the visual mirror does not incorrectly mirror the stream sent to the model.

### Garment prompt

Use a concise prompt based on verified product metadata. Preserve the intended garment type, colour, pattern, and overall design. Do not claim exact sizing, fit, or fabric physics. Do not send customer identity or unnecessary personal data to an LLM.

---

## 9. Screen recording — record, replay and delete

**Important:** the recording must capture the AI-transformed output stream, not merely the raw webcam preview.

Implement this feature using the browser `MediaRecorder` API.

### Required behavior

- Before recording, show a short consent message explaining that the preview will be recorded temporarily on this device.
- Start recording only after the user taps Record.
- Record the transformed `<video>` element’s actual `srcObject` stream, after verifying it is the remote stream returned by Decart.
- Check `MediaRecorder.isTypeSupported()` and select a supported MIME type, such as a compatible WebM codec. Do not assume MP4 recording works in every browser.
- Keep a hard 30-second maximum for recording.
- Display a clear recording indicator and remaining time.
- Provide **Start recording**, **Stop recording**, **Replay**, and **Delete recording** controls.
- Stop recording automatically at 30 seconds and when the session ends.
- Create a Blob from the recorder chunks and a temporary object URL for playback.
- Replay using a dedicated playback video element or a controlled playback state.
- Delete clears the Blob, chunks, playback state, and object URL.
- Clear the recording on session reset, timeout, or kiosk idle reset.
- Do not upload recordings to Supabase or any server by default.
- Do not automatically save or share customer recordings.
- If the transformed stream is unavailable or the browser does not support the needed recording MIME type, show a helpful message and keep the live try-on usable.

### Implementation cautions

- Use the transformed stream itself where supported: `transformedVideo.srcObject`.
- Do not record the local camera stream as a fallback while claiming it is AI-transformed.
- A canvas-based capture fallback may be considered only after testing its visual quality and audio/video behavior; document limitations and label what is actually recorded.
- Ensure `MediaRecorder.stop()` is called only when appropriate and handle its final `dataavailable` event before building the Blob.
- Revoke each previous `URL.createObjectURL()` when replacing or deleting the clip.
- Clear event handlers and timer references when the component unmounts.
- Recording is a local temporary preview, not a saved customer video.

---

## 10. Session timer and kiosk reset

- Maximum AI preview session: 30 seconds.
- Start the countdown only when the transformed AI stream is actually ready.
- Show remaining time clearly (e.g. `00:30`) and warn at 5 seconds.
- At timeout: stop any active recording, disconnect the AI client, stop camera tracks, clear temporary video, and reset the UI.
- Provide a visible End Session control at all times.
- Add configurable idle reset (suggested 60 seconds without interaction).
- Make the cleanup idempotent and test timeout, manual exit, route change, component unmount, and error paths.
- Do not assume the provider bills for exactly the countdown duration; verify current provider billing.

---

## 11. Demo mode and graceful failure

The project should remain usable while credentials are being configured.

- If Supabase environment variables are absent, show a developer-friendly setup error outside production; do not silently pretend data was saved.
- If Decart credentials/credits are unavailable, show a clear “Demo mode — AI not connected” message.
- Demo mode may show sample garment cards and a positioning preview, but must never claim to perform real virtual try-on or present a raw camera feed as transformed output.
- Do not let demo mode bypass admin authorization or storage security.
- Keep error messages user-friendly; log only safe technical details server-side.
- Provide empty, loading, retry, and failure states for database, image upload, camera, AI, and recording.

---

## 12. Suggested file organization

Adapt this to the existing repository rather than forcing a destructive restructure.

```text
app/
  page.tsx
  kiosk/
    page.tsx
  admin/
    login/page.tsx
    page.tsx
    products/page.tsx
    products/new/page.tsx
    products/[id]/page.tsx
    categories/page.tsx
    settings/page.tsx
  api/
    decart/token/route.ts
    products/route.ts
components/
  kiosk/
    KioskShell.tsx
    CameraPreview.tsx
    PositionGuide.tsx
    CategoryTabs.tsx
    ProductGallery.tsx
    ProductCard.tsx
    TryOnControls.tsx
    RecordingControls.tsx
    SessionTimer.tsx
  admin/
    AdminShell.tsx
    ProductTable.tsx
    ProductForm.tsx
    ImageUploader.tsx
    DeleteProductDialog.tsx
  ui/
hooks/
  useVirtualTryOn.ts
  useScreenRecording.ts
  useKioskSession.ts
lib/
  supabase/
    client.ts
    server.ts
    admin.ts
  auth/
    require-admin.ts
  products/
    schemas.ts
    queries.ts
    mutations.ts
  decart/
    server.ts
    prompts.ts
supabase/
  migrations/
  seed.sql
types/
  database.ts
.env.example
README.md
```

Use server components for secure data loading when practical. Mark camera/AI/recording components with `"use client"` only where browser APIs are needed. Avoid making the entire application a client component.

---

## 13. Build phases — implement in this order

### Phase 1 — repository audit and base UI
- Inspect the current project and retain its setup.
- Confirm `npm run dev` (or the repository’s package-manager equivalent) works.
- Build the kiosk shell and admin layout with responsive styling.
- Add navigation and proper loading/empty/error states.
- Do not stop after a static mockup.

### Phase 2 — Supabase auth and security
- Add Supabase client utilities.
- Create the SQL migration, indexes, updated-at trigger, and seed categories/settings.
- Configure RLS policies for all tables.
- Create the `garment-images` Storage bucket and policies.
- Implement admin login/logout and server-side admin guard.
- Document how the first admin user is added safely.

### Phase 3 — product/category CRUD and image upload/delete
- Implement product list/search/filter.
- Implement create/edit/publish/unpublish/feature/delete.
- Implement category management.
- Implement image upload, replace, preview, progress, validation and deletion cleanup.
- Add delete confirmations and safe error handling.
- Verify unauthorized users cannot mutate products or Storage objects.

### Phase 4 — live kiosk catalogue
- Fetch only active categories and published products.
- Show a maximum of five cards at once and provide paging where needed.
- Reflect admin updates without redeployment.
- Confirm a deleted/unpublished product cannot be selected after refresh/refetch.

### Phase 5 — camera and framing
- Implement Start Camera, local preview, positioning guide, mirror and fit/crop controls.
- Implement framing lock/unlock.
- Handle camera permission denial and device failures.
- Add robust track cleanup.

### Phase 6 — Decart AI stream
- Verify current official SDK and model methods.
- Add the secure token route.
- Connect the stream and render the remote transformed video.
- Implement garment switching within the same session if supported.
- Keep truthful demo/error states if AI credentials are missing.

### Phase 7 — recording and replay
- Record the transformed stream using MediaRecorder.
- Add consent, start/stop, maximum duration, replay and delete.
- Keep recordings in memory/object URLs only.
- Clear them during all reset/cleanup paths.

### Phase 8 — timer, resilience and quality
- Add 30-second session timer and idle reset.
- Test network loss, expired token, exhausted credits, route change and browser refresh.
- Check accessibility, touchscreen target sizes and reduced motion.
- Run lint, type-check, tests and production build; fix errors.
- Update README with setup and test procedures.

---

## 14. Acceptance checklist

Do not report the project as complete until each applicable item has been tested.

### Existing project
- [ ] Existing Next.js app was inspected and reused; no unnecessary re-scaffolding.
- [ ] Existing package manager and lockfile are preserved.
- [ ] Development and production build commands work.

### Supabase/admin
- [ ] Admin can sign in and sign out with Supabase Auth.
- [ ] Non-admin authenticated users and anonymous visitors cannot access admin mutations.
- [ ] RLS is enabled and tested on every relevant table.
- [ ] Admin can create/edit/publish/unpublish/feature/delete products.
- [ ] Admin can create/edit/activate/deactivate categories.
- [ ] Admin can upload, replace and delete product images.
- [ ] Image replacement/deletion failure is handled without silently losing the product image.
- [ ] Only authorized admins can upload/delete Storage objects.
- [ ] Secrets and service-role key never appear in browser bundles.
- [ ] First-admin setup is documented.

### Customer kiosk
- [ ] Kiosk requires no customer login.
- [ ] Only active categories and published products appear.
- [ ] No more than five garment cards are visible at once.
- [ ] Product changes from admin appear without redeployment.
- [ ] Camera starts only after user interaction and permission.
- [ ] Position guide and framing lock behave as described.
- [ ] Demo mode is clearly labelled when AI is not connected.

### AI/recording
- [ ] Real transformed output appears with valid Decart credentials and credits.
- [ ] The app does not mislabel raw webcam video as AI output.
- [ ] Garments can be changed without reconnecting when supported by the SDK.
- [ ] The AI session ends at 30 seconds and cleans up camera/AI resources.
- [ ] Recording captures the transformed stream, not the raw camera.
- [ ] User can start, stop, replay and delete the temporary recording.
- [ ] Recordings are not uploaded or retained after reset by default.
- [ ] Unsupported recording and provider failures produce clear messages.

### Final quality
- [ ] Layout works on 1080p landscape touchscreen and smaller screens.
- [ ] Touch targets, keyboard accessibility and contrast are reasonable.
- [ ] `npm run lint`, type checking, tests, and `npm run build` (or existing equivalents) pass.
- [ ] README documents Supabase setup, first-admin creation, Decart setup, environment variables, run commands, and manual test steps.
- [ ] AI try-on is described as a generated visual approximation, not guaranteed fit or true 3D cloth simulation.

---

## 15. Official references

Use current official docs and verify API signatures before implementation:

- Supabase Next.js SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Next.js docs: https://nextjs.org/docs
- Decart examples: https://github.com/DecartAI/tryon-examples
- Decart digital mirror: https://github.com/DecartAI/tryon-examples/tree/main/examples/digital-mirror
- Decart standalone: https://github.com/DecartAI/tryon-examples/tree/main/examples/standalone
- Decart SDK: https://github.com/DecartAI/sdk
- Decart JavaScript SDK docs: https://docs.platform.decart.ai/sdks/javascript
- Decart Lucy V-TON: https://platform.decart.ai/models/lucy-vton

Decart real-time AI requires an account/API key and may consume credits. Do not promise unlimited free usage. Check the user’s current account, pricing, and trial availability.

---

## 16. Final instructions to the coding agent

Start by inspecting the existing repository. Then implement the project in the phases above, directly editing and creating the necessary files.

Do not:
- Recreate or reinstall Next.js unnecessarily.
- Stop after generating a plan or polished but non-functional UI.
- invent Decart SDK methods; verify the installed SDK types/current official docs.
- expose `DECART_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- trust client-only admin checks.
- allow public image uploads/deletes.
- record the raw camera and label it AI output.
- upload or persist customer recordings by default.
- silently claim that mock output is real AI.

At the end, report:
1. What was implemented.
2. Important files created/modified.
3. Any setup still required in Supabase and Decart.
4. Environment variables to fill in (names only; never ask the user to paste secrets into chat).
5. Exact commands to run the existing project.
6. Lint/type-check/build results.
7. Manual test steps and any remaining limitations.
