# NetUp MVP - Codex Handoff (Updated)

## 1) Muc tieu du an
- Demo san choi the thao NetUp cho 3 vai tro:
  - Nguoi choi
  - Chu san
  - Admin
- Muc tieu demo:
  - Dat san theo 2 luong: `Keo cho ghep` va `Thue nguyen san`
  - Lich truc quan theo san
  - Tu danh gia nang luc theo tung mon de ghep keo
  - Co backend demo bang Supabase de tuong tac thuc te

## 2) Stack hien tai
- Frontend: React + Vite + TypeScript + Tailwind
- Router: React Router
- Map: React Leaflet
- Database: Supabase (Postgres)
- State runtime: `AppStoreProvider` (Supabase-first, fallback mock neu thieu env)

## 3) Cac env can co (frontend)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Co fallback doc env kieu Vercel integration:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4) Nguon du lieu va dong bo
- File chinh: `src/app/providers/AppStoreProvider.tsx`
- App hien tai:
  - Doc/ghi truc tiep `profiles`, `court_complexes`, `courts`, `sessions`, `pool_posts`, `bookings`, `admin_configs`
  - Doc assessment moi tu `player_sport_assessments`
  - Neu bang moi chua ton tai, fallback doc/ghi `player_assessments` (legacy)
- Root layout co banner loading/error DB + nut reload.

## 5) Feature moi quan trong (assessment theo mon)
- Form assessment da doi sang questionnaire A/B/C theo tung mon:
  - Badminton
  - Football
  - Tennis
- Moi mon co bo cau hoi rieng (kinh nghiem, the luc, tan suat, chien thuat)
- He thong tinh `totalScore` va suy ra `calculatedLevel` (Beginner/Intermediate/Advanced)
- Utility nam tai:
  - `src/shared/utils/assessment.ts`
- Page UI:
  - `src/pages/player/PlayerAssessmentPage.tsx`

## 6) Rang buoc tao pool
- Khi tao `Keo cho ghep`, bat buoc nguoi choi da co assessment dung mon cua san.
- Logic chan tao pool nam trong:
  - `createPoolPost(...)` o `AppStoreProvider`
- UI nhac nguoi choi di den trang assessment truoc khi tao post.

## 7) Chi tiet post pool hien assessment thanh vien
- Trang: `src/pages/player/PlayerSessionDetailPage.tsx`
- Neu session la pool:
  - Hien host + thanh vien da apply (booking solo)
  - Hien level va cau tra loi assessment theo dung mon cua san
- Muc dich: cho nguoi choi quyet dinh join pool dua tren profile thuc te.

## 8) Route quan trong
- `/player/discovery`
- `/player/pool-posts`
- `/player/rent-courts`
- `/player/session/:sessionId`
- `/player/booking/:sessionId`
- `/player/assessment`
- `/owner/courts`
- `/admin/config`

## 9) DB schema va seed
- Schema: `supabase/schema.sql`
  - Co bang moi `player_sport_assessments`
- Seed mock: `supabase/migration_data_mock.sql`
  - Da co du lieu assessment theo mon
  - Da co du lieu san/session/booking quanh khu Hoa Lac

## 10) Admin lam sach du lieu test
- Trang admin config co 2 nut:
  - Don du lieu test cua current player
  - Don toan bo du lieu giao dich runtime (booking/pool/assessment/slot runtime)
- Logic nam trong `AppStoreProvider`:
  - `clearCurrentTestData()`
  - `clearAllTransactionalData()`

## 11) File nen doc truoc khi sua
- `src/app/providers/AppStoreProvider.tsx`
- `src/pages/player/PlayerPoolPostsPage.tsx`
- `src/pages/player/PlayerSessionDetailPage.tsx`
- `src/pages/player/PlayerAssessmentPage.tsx`
- `supabase/schema.sql`
- `supabase/migration_data_mock.sql`

## 12) Build/check
- `npm run build` dang pass sau update.
- Neu deploy Vercel ma fallback mock:
  - Kiem tra env `VITE_...`/`NEXT_PUBLIC_...`
  - Redeploy de Vite inject env moi.
