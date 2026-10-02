# Deploy — Climbix Marketing v1

Everything below is verified green locally on this machine
(tsc + `next build` => exit 0, standalone output emitted).
Nothing below can run *from here* for only one reason: **no credentials
(Vercel token / git remote / live agent server) exist on disk.**

---

## 1. Vercel (production)

The project is already linked (`.vercel/project.json` exists,
project `prj_FJjIy...`, org `team_PpXi...`). You only need to authenticate:

```powershell
cd C:\Users\musad\Desktop\climbix-marketing-v1
npx vercel login            # opens browser, one-time
npx vercel --prod           # deploy the linked project
```

- Build command is `prisma generate && next build` (already in `package.json`).
- `output: "standalone"` + `experimental.optimizePackageImports`
  (lucide-react, framer-motion, recharts) are wired in `next.config.ts`.
- Runtime env: set the same `.env` vars as your dev `.env`
  (DATABASE_URL, AUTH_SECRET, NineLabs keys, etc.) in Vercel → Settings → Environment Variables.
- Prisma needs `prisma generate` to run on Vercel — if you use the
  Prisma/Vercel integration it does this automatically; via plain `next build`
  it already runs because the build script includes it.

## 1b. Uploads (required on serverless)

Vercel mounts the app directory **read-only** (`EROFS`), so
`POST /api/media` and `POST /api/documents` cannot write to
`public/uploads` there. Create a Blob store and set its token:

```powershell
npx vercel blob store add blob
```

Then in Vercel → the project → Settings → Environment Variables add:

| Variable                | Value                              |
| ----------------------- | ---------------------------------- |
| `BLOB_READ_WRITE_TOKEN` | the token `vercel blob store add` printed |

Storage is chosen at runtime by `src/lib/storage.ts`:
`BLOB_READ_WRITE_TOKEN` present → Vercel Blob; absent → local disk
(`next dev`, self-hosted containers). Nothing else needs configuring, and the
`/uploads/...` URLs already stored in the database keep working.

Files over 4 MB bypass the serverless 4.5 MB request-body cap by uploading
straight from the browser through `POST /api/media/upload-token`, then
registering the resulting object. That path returns 404 when Blob is not
configured, and the client falls back to the multipart upload.

Existing local files in `public/uploads` are **not** copied to Blob. To migrate
them, re-upload through the admin media library, or move the objects and update
`Media.url` / `Document.url`.

## 2. Self-host (Vercel-free, NFS/ECS/Railway)

The build already emits `.next/standalone` + copies static + public.
There are TWO helper scripts in the repo root that also do this copy:

        scripts
        ├── copy-static.cmd   (old standalone copy path)
        └── ...               (any others already present)

But the modern, supported path is any container that runs the standalone server:

```powershell
# after `npm run build`
cd .next\standalone
node server.js
```

Remember: `cp -r .next/static .next/standalone/.next/static` and
`cp -r public .next/standalone/public` MUST run after `next build`
(this is part of the `build` script already: `cp -r ... && cp -r ...`),
so running `npm run build` alone is not enough — run the full
`npm run build` (it includes the copies) and then start the standalone.

## 3. Realtime voice (LiveKit / Pipecat / CallKit)

Config for these is already saved/exposed (server URL + token URL + API key
fields in admin; the widget already has the public branches). What is NOT
in the repo, by design, is the **agent server** that streams those — you must
run your own:
  - LiveKit → a LiveKit Agents worker (Python) that joins the room
  - Pipecat → a Pipecat AI agent (Python) exposing a WSS endpoint
  - CallKit → a phone SIP bridge

Nothing else is needed on the Next.js side; the widget will stream when the
agent server is reachable at the URLs you configured in admin.

---

### Health check after deploy
- `GET https://<your-domain>/api/agent/config` → 200 JSON with
  `quickReplies`, `browserVoiceName`, `voiceProvider`.
- `POST /api/leads` ×7 fast → 6×201 then `429` (rate limited, 6/min).
- `POST /api/meetings` ×6 fast → 5×201 then `429` (5/min).
