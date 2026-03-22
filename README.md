# Retail Traffic Counter App

A modern web application for tracking retail store traffic with entry and exit counters.

## Features

- **Login Authentication**: Secure login system integrated with Cloudflare
- **Traffic Tracking**: Real-time entry and exit counters
- **Multi-Location Support**: Track traffic from multiple entrances
- **Current Occupancy**: See live occupancy count
- **History**: View traffic patterns over time
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Vite, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers (API)
- **Database**: Cloudflare D1 (SQLite)
- **Hosting**: Cloudflare Pages

## Project Structure

```
src/
├── pages/           # Page components (Login, MainClicker)
├── services/        # Business logic services
├── api/            # API integration
├── utils/          # Utility functions
└── styles/         # CSS styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your Cloudflare Worker API URL to .env
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to Cloudflare Pages.

## API Endpoints

The following endpoints are expected from your Cloudflare Worker backend:

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Traffic
- `GET /traffic/:location/today` - Get today's count for a location
- `POST /traffic/:location/update` - Update count for a location
- `GET /traffic/:location/history?days=7` - Get historical data

## Environment Variables

- `VITE_API_URL` - Base URL for Cloudflare Worker API

## Deployment to Cloudflare Pages

1. Push your code to GitHub
2. Connect your repository to Cloudflare Pages
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable `VITE_API_URL` pointing to your Worker

## Backend Setup (Cloudflare Worker)

Create a new Cloudflare Worker to handle API requests and database operations. See the `backend/` folder for implementation details.

## Design System

This app uses a custom design system with:
- Material Design 3 color palette
- Custom typography (Public Sans + Inter)
- Accessibility-first approach
- High contrast for retail environments

See `design.md` for detailed design guidelines.

## License

MIT
