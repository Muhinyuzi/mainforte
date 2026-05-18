# MainForte

MainForte is a local job and community-help platform focused on fast local connections between people who need help and workers available nearby.

The current MVP targets the Témiscaming region in Quebec, Canada.

Users can:

* Publish local jobs and urgent needs
* Apply to nearby jobs
* Browse worker and client profiles
* Chat with each other
* Leave reviews after completed work
* Manage skills and availability
* Receive notifications about applications and jobs

---

# Tech Stack

## Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* Alembic
* JWT Authentication

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

## Infrastructure

* DigitalOcean Droplet
* Nginx
* Gunicorn/Uvicorn
* Let's Encrypt SSL

---

# Current MVP Features

## Authentication

* User registration
* Login
* JWT authentication
* Worker / Client modes

## Worker Features

* Public worker profiles
* Skills/categories system
* Availability management
* Job applications
* Dashboard
* Reviews received

## Client Features

* Publish jobs
* Manage applications
* Accept workers
* Track job status
* Leave reviews

## Matching

* Region-based matching
* City distance calculation
* Compatibility scoring

## Messaging

* Conversations
* Messages
* Notifications

---

# Region Support

Current supported region:

```python
TEMISCAMING_REGION = "Temiscaming"
```

Supported cities:

```python
TEMISCAMING_CITIES = [
    "Ville-Marie",
    "Duhamel-Ouest",
    "Notre-Dame-du-Nord",
    "Lorrainville",
    "Saint-Bruno-de-Guigues",
    "Béarn",
    "Témiscaming",
]
```

---

# Categories

Current categories:

```python
categories_data = [
    ("Déménagement", "demenagement"),
    ("Ménage", "menage"),
    ("Jardinage", "jardinage"),
    ("Peinture", "peinture"),
    ("Transport", "transport"),
    ("Livraison", "livraison"),
    ("Gardiennage", "gardiennage"),
    ("Aide ponctuelle", "aide-ponctuelle"),
    ("Déneigement", "deneigement"),
    ("Bois de chauffage", "bois-chauffage"),
    ("Petites réparations", "petites-reparations"),
    ("Assemblage de meubles", "assemblage-meubles"),
    ("Entretien extérieur", "entretien-exterieur"),
    ("Aide aux personnes âgées", "aide-personnes-agees"),
    ("Informatique", "informatique"),
    ("Électricité", "electricite"),
    ("Plomberie", "plomberie"),
]
```

---

# Project Structure

## Backend

```txt
apps/api/
├── app/
│   ├── core/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── constants/
│   ├── utils/
│   └── db.py
├── alembic/
├── seed.py
├── requirements.txt
└── main.py
```

## Frontend

```txt
apps/web/
├── app/
├── components/
├── lib/
├── public/
└── package.json
```

---

# Local Development

## Backend

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run migrations

```bash
alembic upgrade head
```

### Run seed

```bash
python seed.py
```

### Start backend

```bash
uvicorn app.main:app --reload
```

Backend:

```txt
http://localhost:8000
```

---

## Frontend

### Install dependencies

```bash
npm install
```

### Start frontend

```bash
npm run dev
```

Frontend:

```txt
http://localhost:3000
```

---

# Environment Variables

## Backend

```env
DATABASE_URL=
SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

# Deployment

## Suggested Production Architecture

```txt
DigitalOcean Droplet
├── mainforte-api
├── mainforte-web
├── nginx
├── postgres
└── ssl
```

---

# Domains

Current domain:

```txt
mainforte.app
```

Suggested production routing:

```txt
mainforte.app        -> Frontend
www.mainforte.app    -> Frontend
api.mainforte.app    -> Backend API
```

---

# Future Ideas

* Real image uploads
* Mobile app
* Push notifications
* Advanced distance filtering
* Worker verification
* Payment integration
* PayFor integration
* Local emergency jobs
* Real-time messaging

---

# Long-Term Vision

MainForte aims to become a local-first platform helping communities quickly find trusted nearby help for real daily needs.

Potential integration with PayFor:

* Payment links
* Official payment proof
* Secure transactions
* Worker payouts
* Receipt generation
* Local service payments

---

# License

Private MVP project.
