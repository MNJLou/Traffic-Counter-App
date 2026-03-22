# Cloudflare Worker Setup Guide

## Prerequisites

- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare account
- D1 database created in Cloudflare

## Setup Steps

### 1. Initialize Wrangler Project

```bash
wrangler init
```

### 2. Create D1 Database

```bash
wrangler d1 create traffic-counter-db
```

### 3. Initialize Database Schema

```bash
wrangler d1 execute traffic-counter-db --file ./schema.sql
```

### 4. Update wrangler.toml

```toml
name = "traffic-counter-api"
main = "worker.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "traffic-counter-db"
database_id = "YOUR_DB_ID"

[env.production]
routes = [ { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" } ]

[env.production.d1_databases]
binding = "DB"
database_name = "traffic-counter-db"
database_id = "YOUR_DB_ID"
```

### 5. Set Environment Variables

```bash
wrangler secret put JWT_SECRET
# Enter your JWT secret
```

### 6. Develop Locally

```bash
wrangler dev
```

Server runs at `http://localhost:8787`

### 7. Deploy to Production

```bash
wrangler deploy --env production
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Traffic Tracking
- `GET /traffic/:location/today` - Get today's count
- `POST /traffic/:location/update` - Update traffic count
- `GET /traffic/:location/history?days=7` - Get historical data

## Scheduled Tasks

The worker includes a scheduled handler that syncs traffic data every 15 minutes:

```toml
[[triggers.crons]]
cron = "*/15 * * * *"
```

This runs the `handleScheduled` function every 15 minutes to aggregate and store traffic data.

## Testing

```bash
curl -X GET http://localhost:8787/traffic/main/today

curl -X POST http://localhost:8787/traffic/main/update \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"in": 10, "out": 5}'
```

## Deployment to Cloudflare Pages

1. Build frontend: `npm run build`
2. Create Pages project linked to your repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-api-subdomain.workers.dev`

## Monitoring

Use Cloudflare dashboard to monitor:
- Worker performance
- Database queries
- Error rates
- Request analytics
