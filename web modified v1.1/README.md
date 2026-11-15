# BubbaBlox Web

Next.js site with its own backend (API routes + Postgres): accounts, games, catalog and an admin panel.
It is a new codebase, not the original BubbaBlox .NET source (that cannot run on Vercel).

## Run locally on Debian
```
bash setup-debian.sh     # installs Postgres + Node, creates the DB, writes .env.local, runs npm install
npm run dev              # http://localhost:3000
```
Debug: open http://localhost:3000/api/health  (should return {"ok":true,...}).
The first account you sign up becomes admin (or set ADMIN_USERNAME in .env.local). Admin panel: /admin.

## Deploy on Vercel
1. Put these files at the ROOT of a GitHub repo (package.json at the top, no subfolder).
2. Vercel > Add New > Project > import it. Project name: letters, digits and dashes only.
3. Environment Variables: `AUTH_SECRET` (long random string). Optional: `ADMIN_USERNAME`.
4. Deploy, then Storage tab > Create > Neon (adds DATABASE_URL), then Redeploy.
5. Check https://YOUR-SITE/api/health, then sign up.

## Admin panel (/admin)
Create users (optionally with a fixed ID, e.g. 2500 UGC / 12 BadDecisions, password blank = nullified),
ban/unban, make/remove admin, set Robux, set or nullify password, delete users, manage games and catalog.
