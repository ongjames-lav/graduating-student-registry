# Graduating Student Registry

A web application for managing graduating student registrations at BSIT department. Built with FastAPI backend and modern web frontend.
<img width="1900" height="872" alt="image" src="https://github.com/user-attachments/assets/8e0dd03e-faf8-4396-9776-bb14b2d93af4" />

## Features

- Student Registration System
- User Authentication
- Profile Management
- Admin Dashboard with CRUD Operations
- Responsive Design with Glass Morphism UI
- Secure Password Handling
- JWT Token Authentication

## Tech Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- Pydantic (Data validation)
- JWT Authentication
- SQLite Database

### Frontend
- HTML5
- TailwindCSS
- JavaScript (Vanilla)
- Glass Morphism Design

## Project Structure

```
graduating-student-registry/
├── backend/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   ├── routes.py
│   ├── auth.py
│   ├── database.py
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── login.html
    ├── dashboard.html
    └── app.js
```

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- A modern web browser

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/ongjames-lav/graduating-student-registry.git
cd graduating-student-registry
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv student-registry
student-registry\Scripts\activate

# Linux/Mac
python3 -m venv student-registry
source student-registry/bin/activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Serve the frontend (using Python's built-in server for development):
```bash
python -m http.server 5500
```

The frontend will be available at `http://localhost:5500`

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage

1. Register a new account at `/index.html`
2. Login with your credentials at `/login.html`
3. Manage your profile at `/dashboard.html`
4. Admins can access the admin panel at `/admin/index.html`

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- CORS protection
- Input validation
- XSS protection
- SQL injection prevention through ORM

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@ongjames-lav](https://github.com/ongjames-lav)

Project Link: [https://github.com/ongjames-lav/graduating-student-registry](https://github.com/ongjames-lav/graduating-student-registry)
