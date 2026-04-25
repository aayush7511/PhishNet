# PhishNet

An AI-powered phishing email scanner. Paste a suspicious email, get a risk score from 0–100, and see exactly which red flags triggered it — explained in plain English.

**Live demo:** [phish-net-lake.vercel.app](https://phish-net-lake.vercel.app)

---

## What it does

- Paste any email content into the scanner
- Receive a 0–100 risk score with a LOW / MEDIUM / HIGH label
- See up to 6 expandable findings explaining what triggered the score
- Sign in to save your scan history(last 50 scans)
- Works as a guest — no account required to scan

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Pure CSS |
| Backend | Python 3.11, Flask 3.1, Gunicorn |
| Database | SQLite (dev) → PostgreSQL (prod) via Flask-SQLAlchemy |
| Auth | JWT (HS256) + Flask-Bcrypt |
| AI | OpenAI GPT-4o-mini |
| Frontend hosting | Vercel |
| Backend hosting | Render.com |

---

## Repository structure

```
PhishNet/
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # root component, screen state machine
│   │   ├── api/
│   │   │   └── client.js         # apiFetch() wrapper, token management
│   │   ├── components/
│   │   │   ├── screens/
│   │   │   │   ├── InputScreen.jsx
│   │   │   │   ├── ScanningScreen.jsx
│   │   │   │   └── ResultsScreen.jsx
│   │   │   ├── auth/             # AuthModal, AuthForm, AuthTabs
│   │   │   ├── input/            # PasteArea, ScanButton, StatRow, ExtractButton
│   │   │   ├── results/          # ScoreDisplay, FindingsList, GuestUpsell
│   │   │   ├── scanning/         # ShieldPulse, ProgressBar, StepRow
│   │   │   └── profile/          # ProfilePanel, HistoryItem
│   │   ├── hooks/
│   │   │   └── useScanStats.js   # localStorage daily count + last scan
│   │   └── utils/
│   │       ├── emailParser.js    # parses From / Subject / Date headers
│   │       └── timeAgo.js
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── app.py                    # Flask app factory (create_app)
    ├── config.py                 # env var configuration
    ├── extensions.py             # db, bcrypt instances
    ├── Procfile                  # web: gunicorn app:app
    ├── runtime.txt               # python-3.11.9
    ├── requirements.txt
    ├── analysis/
    │   ├── deterministic.py      # URL, domain spoof, keyword checks
    │   ├── ai_layer.py           # GPT-4o-mini NLP analysis
    │   ├── scorer.py             # score aggregation + findings builder
    │   └── pipeline.py           # orchestrates layers 1 + 2
    ├── routes/
    │   ├── analyze.py            # POST /analyze
    │   ├── auth.py               # POST /auth/register, login, logout, GET /auth/me
    │   └── history.py            # GET /history
    └── models/
        ├── user.py               # User model
        └── scan.py               # Scan model
```

---

## How the analysis pipeline works

Emails are scored by two layers that run sequentially. The final score is capped at 100.

### Layer 1 — Deterministic (~100ms, no external calls)

| Check | File | Max points | What it does |
|---|---|---|---|
| Suspicious URLs | `deterministic.py` | +35 | Extracts all URLs, checks TLD against 10 suspicious extensions (.ru .xyz .tk .pw .top .gq .ml .cf .ga .work), flags brand impersonation |
| Sensitive keywords | `deterministic.py` | +25 | Scans body for 22 credential-harvesting phrases (password, SSN, CVV, wire transfer, etc.) |
| Sender domain spoof | `deterministic.py` | +20 | Parses From: header, flags mismatches where display name claims a brand but sending domain doesn't match |

### Layer 2 — GPT-4o-mini NLP

| Signal | File | Max points | What it detects |
|---|---|---|---|
| Urgency score | `ai_layer.py` | +15 | Integer 0–100 mapped via `round(urgency/100 * 15)` |
| Coercive language | `ai_layer.py` | +10 | Pressure tactics forcing immediate action |
| Impersonation | `ai_layer.py` | +10 | Brand mimicry not caught by name-matching |

**Score thresholds:** LOW < 34 · MEDIUM 34–66 · HIGH ≥ 67

If the OpenAI API is unavailable, the pipeline returns a graceful fallback (Layer 1 scores only) and the scan still completes.

---

## Local development

### Prerequisites

- Node.js 18+
- Python 3.11
- An OpenAI API key

### Frontend

```bash
cd frontend
npm install
npm run dev
# runs on http://localhost:5173
```

### Backend

```bash
cd backend

# create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# create a .env file
cp .env.example .env
# fill in FLASK_SECRET_KEY and OPENAI_API_KEY

# run the dev server
python app.py
# runs on http://localhost:5001
```

### Environment variables

**Backend `.env`**

```env
FLASK_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-...
DATABASE_URL=sqlite:///phishnet.db
FRONTEND_ORIGIN=http://localhost:5173
FLASK_ENV=development
```

**Frontend `.env.local`**

```env
VITE_API_BASE_URL=http://localhost:5001
```

SQLite is created automatically on first run — no database setup required in development.

---

## API reference

All endpoints return JSON. Auth is optional on `/analyze` — guests can scan, authenticated users get scans saved to history.

### `POST /analyze`

Run phishing analysis on an email.

**Request body**
```json
{ "email_text": "string (max 50,000 chars)" }
```

**Response**
```json
{
  "score": 87,
  "risk_level": "high",
  "risk_label": "High risk — likely phishing",
  "findings": [
    {
      "id": "suspicious_url",
      "label": "Suspicious link: paypal-secure.ru",
      "severity": "HIGH",
      "detail": "Domain uses .ru TLD mimicking paypal.com",
      "passed": false
    }
  ],
  "ai_reasoning": "Email uses urgent language and impersonates PayPal."
}
```

### `POST /auth/register`

```json
{ "username": "string", "email": "string", "password": "string" }
```

Password rules: 8+ chars, 1 uppercase, 1 digit. Username: 2–50 chars, alphanumeric + underscore.

### `POST /auth/login`

```json
{ "email": "string", "password": "string" }
```

Returns `{ "user": {...}, "token": "JWT" }` and sets an httpOnly cookie.

### `GET /auth/me`

Returns the current user from Bearer token. No body required.

### `GET /history`

Returns last 50 scans for the authenticated user.

### `POST /auth/logout`

Clears the auth cookie.

### `GET /health`

Status check — returns `{ "status": "ok" }`.

---

## Authentication

JWT (HS256) with a 7-day expiry. The token is:
- Returned in the login response body
- Stored in `localStorage` as `phishnet_auth_token` by the frontend
- Sent on every request as `Authorization: Bearer <token>`
- Also set as an httpOnly cookie (`phishnet_token`) as a cross-origin fallback

---

## Deployment

### Frontend → Vercel

1. Connect your GitHub repo to Vercel
2. Set build command: `npm run build`, output dir: `dist`
3. Add environment variable: `VITE_API_BASE_URL=https://your-render-url.onrender.com`
4. Deploy — Vercel auto-deploys on every push to `main`

### Backend → Render

1. Create a new Web Service on Render, connect your GitHub repo
2. Set root directory to `backend/`
3. Render will detect the `Procfile` automatically (`web: gunicorn app:app`)
4. Add environment variables in the Render dashboard:

```
FLASK_SECRET_KEY      = <generate a strong random key>
OPENAI_API_KEY        = sk-...
DATABASE_URL          = <Render PostgreSQL connection string>
FRONTEND_ORIGIN       = https://your-app.vercel.app
FLASK_ENV             = production
```

5. Add a PostgreSQL database in Render and link it — `DATABASE_URL` is set automatically.

---

## Database

Two tables managed by Flask-SQLAlchemy. Schema is created automatically on startup via `db.create_all()`.

**users**
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| username | String(50) | Unique |
| email | String(255) | Unique, lowercase |
| password_hash | String(72) | Bcrypt hash |
| created_at | DateTime | UTC |

**scans**
| Column | Type | Notes |
|---|---|---|
| id | Integer | Primary key |
| user_id | Integer | FK → users.id |
| score | Integer | 0–100 |
| risk_level | String(10) | low / medium / high |
| risk_label | String(60) | Human-readable label |
| findings | Text | JSON-serialised list |
| ai_reasoning | Text | GPT explanation |
| email_preview | String(200) | First 200 chars of email |
| created_at | DateTime | UTC |

---

## Dependencies

### Frontend

```
react ^19.2.4
react-dom ^19.2.4
vite ^8.0.4
@vitejs/plugin-react ^6.0.1
```

### Backend

```
flask==3.1.0
flask-cors==5.0.0
flask-sqlalchemy==3.1.1
flask-bcrypt==1.0.1
pyjwt==2.10.1
openai==1.60.0
python-dotenv==1.0.1
gunicorn==23.0.0
```

---

## Team

- Adarsh Paul
- Aayush Srivastava
- Jay Trivedi
