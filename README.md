# StoryHero

StoryHero creates personalized bilingual Thai/English children's books from a child's photo. This repository is the direct-provider version: it no longer depends on SkillBoss for authentication, AI generation, email, media storage, or deployment.

## Architecture

- React + Vite frontend
- Hono API on Cloudflare Workers
- Cloudflare D1 for application data
- Cloudflare R2 for private child photos and generated public media
- Google Gemini for story writing and narration
- Gemini or Higgsfield MCP for illustrations (`IMAGE_PROVIDER`)
- Resend for email OTP and book-ready messages
- Optional Google Identity Services login

Child photos are private R2 objects and are only served through authenticated API routes. Generated book media is copied into this project's own R2 bucket and is served only to the signed-in parent or through an explicitly enabled family link.

## Local development

1. Install dependencies with `npm install`.
2. Copy `.dev.vars.example` to `.dev.vars` and fill in the provider credentials.
3. Apply the local schema with `npx wrangler d1 migrations apply DB --local`.
4. Start both services with `npm run dev`.
5. Open `http://127.0.0.1:5173`.

The web app proxies `/api` and `/media` to the local Worker on port 8787.

## Provider configuration

`IMAGE_PROVIDER=gemini` uses `GEMINI_API_KEY` for writing, illustration, and TTS. Gemini image generation must have non-zero quota in the selected Google project. `GEMINI_DAILY_IMAGE_LIMIT` is the app-wide illustration safety ceiling.

`IMAGE_PROVIDER=higgsfield` keeps Gemini for writing/TTS and uses Higgsfield MCP for illustrations. The owner connects once from `/admin`; OAuth tokens are encrypted at rest and the app uses the owner's existing Higgsfield plan credits. `HIGGSFIELD_DAILY_CREDIT_LIMIT` is a hard server-side daily ceiling (100 by default).

Resend requires `RESEND_API_KEY` and a verified sender in `EMAIL_FROM`. The current production sender is `StoryHero <hello@theaiceos.com>`.

Google sign-in is optional. Without `GOOGLE_CLIENT_ID`, the Google button is hidden and email OTP remains fully functional.

`OTP_IP_HOURLY_LIMIT` caps login-code emails from one connection. New parent accounts also have small beta caps for child profiles and hero redraws.

## Verification

```bash
npm run check
npm run build
npx wrangler deploy --dry-run
```

## Production deployment

The Cloudflare resources configured in `wrangler.toml` are:

- D1: `storyhero-db-direct`
- R2: `storyhero-media-direct`
- Worker: `storyhero-direct`

After R2 is activated for the Cloudflare account:

```bash
npx wrangler r2 bucket create storyhero-media-direct
npx wrangler d1 migrations apply DB --remote
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put HIGGSFIELD_TOKEN_ENCRYPTION_KEY
npm run deploy
```

After deployment, sign in as the owner, open `/admin`, and select **Connect Higgsfield** to authorize the MCP connection. Set `GOOGLE_CLIENT_ID` as a Worker variable after creating a Web OAuth client for the final production origin.

## Legacy migration

`scripts/migrate-skillboss-assets.mjs` copies static SkillBoss-hosted design assets into `public/legacy`.

`scripts/export-live-books.mjs` archives completed books from the old public share API into the ignored `migration/legacy-books` directory. `scripts/import-live-books.mjs` uploads that archive to the new R2 bucket and prepares/imports matching D1 records. Run the importer only after the production R2 bucket and Worker origin exist.

The old SkillBoss deployment should remain untouched until the direct deployment has passed login, story, illustration, narration, and migrated-book checks.

## Privacy and operating notes

- `.dev.vars`, migration archives, build output, and Wrangler state are ignored by source control.
- Do not commit API keys or child photos.
- New books are private by default. A parent can enable and revoke a family link from the reader; only owner-curated books can appear in the landing gallery.
- New child profiles require an explicit parent/legal-guardian consent record. Parents can permanently delete a child profile or their account from `/privacy-data`; owned R2 media is removed with the database records.
- Seven completed legacy books are archived locally for migration. The original private source photos are unavailable through the old public API, so owners should upload fresh photos for future generation.
- The direct app returns structured JSON errors for API failures, including provider quota and billing issues.
