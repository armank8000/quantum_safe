# ⚛ Quantum Shield Frontend

> India's first Post-Quantum Cryptography security platform  
> APT HEX Team | PNB Hackathon 2026

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

**Login:** `hackathon_user@pnb.bank.in` / `password123`

## Pages

| Route | Page |
|-------|------|
| `/dashboard` | KPI cards + charts + activity |
| `/assets` | Asset inventory table + scan |
| `/discovery` | Subdomain / SSL / IP / Software tabs |
| `/network` | D3.js network graph |
| `/cbom` | Cipher Bill of Materials |
| `/pqc` | PQC Posture (liboqs) |
| `/ai-recs` | AI Recommendations + Gantt |
| `/rating` | Cyber Rating 0-1000 |
| `/chat` | AI Chatbot |
| `/reports` | PDF/Excel/JSON reports |
| `/badge` | PQC Digital Badge |
| `/compliance` | RBI + CERT-In compliance |

## Connecting to Backend

Set backend URL in `vite.config.js`:
```js
proxy: { '/api': { target: 'http://localhost:8000' } }
```

All API calls use `/api/*` prefix. See `API_DOCS.md` for full documentation.

## Tech Stack
- React 18 + Vite
- React Router v6
- Recharts (charts)
- D3.js (network graph)
- Axios (API calls)
- Lucide React (icons)
- Tailwind CSS

## Demo Mode
If backend is not connected, all pages show realistic demo data automatically.
