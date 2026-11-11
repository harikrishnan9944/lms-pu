# LMS Python Backend (FastAPI)

This is the Python FastAPI backend service for the LMS Application. It handles Authentication, User Management, Dashboard Metrics, and JWT access tokens.

---

## 🚀 Getting Started

### 1. Create and Activate Python Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate on Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Activate on Windows (CMD):
.\venv\Scripts\activate.bat

# Activate on Linux/macOS:
source venv/bin/activate
```

---

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 3. Seed Database

Run the seed script to create database tables and initial users (Admin, Coordinator, Faculty, Student):

```bash
python seed.py
```

---

### 4. Run Development Server

Launch the Uvicorn development server:

```bash
python main.py
# or: uvicorn app.main:app --reload --port 8000
```

The server will be available at:
- **Base API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive OpenAPI Docs (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc API Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🔑 Pre-seeded Login Credentials

| Role | Username / Email | Password |
|---|---|---|
| **Admin** | `admin` / `admin@lms.edu` | `Admin@123456` |
| **Program Coordinator** | `priya_coord` / `priya@lms.edu` | `Password@123` |
| **Faculty** | `arunkumar` / `arun@lms.edu` | `Password@123` |
| **Student** | `karthik` / `karthik@lms.edu` | `Password@123` |
| **Student** | `ananya` / `ananya@lms.edu` | `Password@123` |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | ❌ |
| `GET` | `/api/auth/me` | Fetch logged-in user details | 🔑 User |
| `POST` | `/api/auth/logout` | Logout user | ❌ |
| `GET` | `/api/users` | List paginated users with search & filters | 🛡️ Admin |
| `POST` | `/api/users` | Create new user account | 🛡️ Admin |
| `PUT` | `/api/users/{user_id}` | Edit user details | 🛡️ Admin |
| `PATCH` | `/api/users/{user_id}/status` | Toggle ACTIVE / INACTIVE status | 🛡️ Admin |
| `POST` | `/api/users/{user_id}/reset-password` | Reset user password | 🛡️ Admin |
| `GET` | `/api/metrics` | Dashboard statistics counts | 🛡️ Admin |
