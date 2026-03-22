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
vars = { ENVIRONMENT = "production" }

[env.production.d1_databases]
binding = "DB"
database_name = "traffic-counter-db"
database_id = "YOUR_DB_ID"
```

### 5. Develop Locally

```bash
wrangler dev
```

Server runs at `http://localhost:8787`

### 6. Deploy to Production

```bash
wrangler deploy
```

## API Endpoints

### Submit Session Data
- `POST /submit` - Submit 15-minute session data
  ```json
  {
    "name": "John Smith",
    "session": "2026-03-22T14:00",
    "location": "main",
    "customer_in": 42,
    "customer_out": 38,
    "out_with_bags": 32
  }
  ```

### Get Session History
- `GET /history?location=main&name=John%20Smith&limit=10` - Get past session records

### Get Session Stats
- `GET /stats?session=2026-03-22T14:00` - Get aggregated stats for a session

### Health Check
- `GET /health` - Check if API is running

## Database Schema

Single table: `traffic_sessions`

Columns:
- `id` - Auto-incrementing primary key
- `name` - Staff member name
- `session` - Session timestamp (from dropdown, e.g., "2026-03-22T14:00")
- `location` - Store location (main, back, side)
- `customer_in` - Number of customers entering
- `customer_out` - Number of customers leaving
- `out_with_bags` - Number of customers leaving with bags
- `timestamp` - When the record was created

## Frontend Configuration

Add to `.env`:
```
VITE_API_URL=https://your-api-subdomain.workers.dev
```

Or for local development:
```
VITE_API_URL=http://localhost:8787
```

## How It Works

1. **Staff selects** name and session from dropdowns
2. **Counts accumulate** - Numbers update instantly as +/- buttons are clicked
3. **Data saved locally** - Counts persist in localStorage
4. **Auto-submit every 15 minutes** - When countdown reaches 0:00, the session data is automatically sent to the database
5. **New session starts** - Countdown resets, counts reset to 0, ready for next session

## Testing

```bash
# Health check
curl http://localhost:8787/health

# Submit test data
curl -X POST http://localhost:8787/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "session": "2026-03-22T14:00",
    "location": "main",
    "customer_in": 42,
    "customer_out": 38,
    "out_with_bags": 32
  }'

# Get history
curl "http://localhost:8787/history?location=main&name=John%20Smith"

# Get stats
curl "http://localhost:8787/stats?session=2026-03-22T14:00"
```

## Deployment to Cloudflare Pages

1. Build frontend: `npm run build`
2. Create Pages project linked to your repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-api-subdomain.workers.dev`
