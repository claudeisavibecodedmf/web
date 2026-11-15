#!/usr/bin/env bash
# One-time local setup for Debian/Ubuntu: Postgres + Node + .env.local + npm install
set -euo pipefail
DB=bubbablox; DBUSER=bubba; DBPASS=bubba

sudo apt update
sudo apt install -y postgresql nodejs npm openssl
sudo systemctl enable --now postgresql

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DBUSER'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER $DBUSER WITH PASSWORD '$DBPASS';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB'" | grep -q 1 \
  || sudo -u postgres createdb -O $DBUSER $DB

if [ ! -f .env.local ]; then
  {
    echo "DATABASE_URL=postgres://$DBUSER:$DBPASS@localhost:5432/$DB"
    echo "AUTH_SECRET=$(openssl rand -base64 32)"
    echo "OWNER_USERNAME=owner"
    echo "OWNER_PASSWORD=$(openssl rand -base64 12)"
  } > .env.local
  echo "Wrote .env.local"
fi

npm install
echo
echo "Done. Start the site with:  npm run dev   (http://localhost:3000)"
echo "Owner login (admin at /admin): see OWNER_USERNAME / OWNER_PASSWORD in .env.local"
echo "Check the database (dev only): http://localhost:3000/api/health"
