# Zenith_Champs
Builderthon

## Demo implementation

This repository now includes a minimal full-stack builderthon demo based on the provided database deployment screen:

- Frontend: static HTML/CSS/JS in `/public`
- Backend: Node HTTP server in `/server.js`
- Data store: simple JSON file database at `/data/db.json` with seeded task/member data

### Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

### Test

```bash
npm test
```

### Interswitch use in this project

Use Interswitch on the backend payment integration layer:

- initialize payment requests from checkout/order endpoints
- verify transaction status via secure server-side callback/verify endpoints
- keep API keys in environment variables and never in frontend code

### Free hosting suggestions

- Frontend: Netlify, Vercel, Cloudflare Pages
- Backend: Render free tier, Fly.io free allowance, Railway trial
- Database: Supabase free tier or Firebase Spark plan
