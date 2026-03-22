# Development Credentials

## Frontend Setup

For local development, test the app with these credentials:

**Admin Account:**
- Email: `admin@test.com`
- Password: `password123`

**Staff Account:**
- Email: `staff@test.com`
- Password: `password123`

## Running Locally

### 1. Start the Frontend Dev Server

```bash
npm run dev
```

This starts Vite on `http://localhost:5173`

### 2. Start the Backend Worker (Optional)

For full local testing with the database, in the `backend/` folder:

```bash
wrangler dev
```

This runs the worker on `http://localhost:8787`

### 3. Configure Frontend to Use Local Worker

Create `.env.local`:

```
VITE_API_URL=http://localhost:8787
```

## Testing Flow

1. Open `http://localhost:5173/login.html`
2. Login with `admin@test.com` / `password123`
3. You'll be redirected to the main clicker page at `http://localhost:5173/index.html`
4. Try clicking the counter buttons and location selector

## ⚠️ Important: Production Setup

Before deploying to production:

1. **Replace test credentials** in `backend/worker.ts` with real database validation
2. **Implement real JWT signing** with a secret key
3. **Use password hashing** (bcryptjs or similar)
4. **Set `JWT_SECRET`** in Cloudflare environment
5. **Remove `DEV_CREDENTIALS`** from code

See `backend/SETUP.md` for production deployment steps.
