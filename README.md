## Sudeeep G.V — Portfolio (Frontend + Backend + Database)

This is a single-page portfolio website served by a Python Flask backend.

- **Frontend**: `backend/templates/index.html` + `backend/static/style.css` + `backend/static/script.js`
- **Backend API**: Flask (`/api/contact`, `/api/visit`, etc.)
- **Database**: SQLite (auto-created)

### 1) Put your profile photo

Save your photo as:

- `backend/static/assets/profile.jpg`

### 2) Run locally (VS Code terminal)

Open terminal in the `sudeep2` folder, then:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

Open:

- `http://localhost:5000`
- Admin page (shows saved messages): `http://localhost:5000/admin`

### 3) API endpoints

- `POST /api/contact` → saves form to SQLite
- `POST /api/visit` → increments visitor count
- `GET /api/contacts` → list messages (used by `/admin`)

### 4) Deploy online (GitHub + Render)

See the step-by-step instructions in chat.

