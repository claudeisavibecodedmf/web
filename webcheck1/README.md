# BubbaBlox Web

Next.js site with its own backend (API routes + Postgres): accounts, games, catalog, inventory,
daily Robux, user-to-user trading and an owner-only admin panel.
New codebase made to run on Vercel (the original .NET/Windows sources cannot run there).

## Deploy on Vercel
1. Put these files at the ROOT of a GitHub repo (package.json at the top, no spaces in folder names).
2. Import it in Vercel. Project name: letters, digits, dashes only.
3. Environment Variables: `AUTH_SECRET`, `OWNER_USERNAME`, `OWNER_PASSWORD`.
4. Deploy, then Storage > Neon (adds DATABASE_URL), then Redeploy.
5. Log in with OWNER_USERNAME / OWNER_PASSWORD once (on the Log in page). That creates the owner account.
   Only that account can open /admin. Everyone else gets a 404 there.

## RAP and values
- `/values` shows every item's value (set by the owner in /admin > Catalog > Set value), RAP (average of the last 10 resale prices), sales, owners and the cheapest resale listing.
- Users list items for sale from Inventory; buying the cheapest listing records a sale, which updates RAP.

## Notes
- `/api/health` returns 403 for everyone on the live site. It only works locally with `npm run dev`.
- Nobody can sign up with the owner username (it is reserved).
- Trading: send a trade to any user (items and/or Robux); the receiver can accept, decline; the sender can cancel.
  Accepting swaps everything atomically in one database transaction.

## Run locally on Debian
```
bash setup-debian.sh
npm run dev      # http://localhost:3000
```
