# BubbaBlox Web (Vercel)

Next.js site with its own Vercel-hosted backend (API routes + Neon Postgres).
Includes: accounts (sign up / log in / log out), games list, catalog.
This is a new codebase, not the original BubbaBlox .NET source, which cannot run on Vercel.

## Deploy
1. Push this folder to a GitHub repo.
2. vercel.com > Add New > Project > import the repo.
3. In the project: Storage > Create > Neon (Postgres). This adds `DATABASE_URL` automatically.
4. Settings > Environment Variables: add `AUTH_SECRET` (run `openssl rand -base64 32`). Optional: `NEXT_PUBLIC_SITE_NAME`.
5. Deploy. Tables and sample data are created on first request.

CLI alternative: `npm i -g vercel && vercel` in this folder, then add the Neon store and `AUTH_SECRET` in the dashboard and run `vercel --prod`.

## Local
`npm install`, copy `.env.example` to `.env.local`, fill it in, `npm run dev`.
