from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from . import models  # Import models to ensure they are registered with SQLAlchemy
from .routes import router
from .database import engine, Base
import uvicorn

# Create FastAPI instance
app = FastAPI(title="Student Registry API")

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure CORS with specific allowed origins
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://ongjames-lav.github.io",  # GitHub Pages base domain
    "https://ongjames-lav.github.io/membership-registry",  # Specific GitHub Pages URL
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://*.onrender.com",  # Render.com domains
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
    expose_headers=["Content-Type", "Authorization"],
    max_age=3600
)

# Mount static files
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# Include routes
app.include_router(router)

# Admin password
ADMIN_PASSWORD = "nakalimutanko"

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Student Registry API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Admin panel routes
@app.get("/admin-panel", response_class=HTMLResponse)
async def admin_panel(request: Request):
    if request.cookies.get("admin_access") == "granted":
        with open("backend/static/admin_panel.html") as f:
            return HTMLResponse(f.read())
    return RedirectResponse("/admin-login")

@app.get("/admin-login", response_class=HTMLResponse)
async def admin_login_form():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - Student Registry</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .animate-gradient {
                background: linear-gradient(270deg, #000000, #1a1a1a, #000000);
                background-size: 600% 600%;
                animation: gradientBG 10s ease infinite;
            }
            @keyframes gradientBG {
                0% { background-position: 0% 50% }
                50% { background-position: 100% 50% }
                100% { background-position: 0% 50% }
            }
            .glass-effect {
                background: rgba(31, 41, 55, 0.7);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 127, 0, 0.1);
            }
            .gradient-border {
                border: double 1px transparent;
                background-image: linear-gradient(#1f2937, #1f2937), 
                                linear-gradient(to right, #ff7f00, #ff4b00);
                background-origin: border-box;
                background-clip: padding-box, border-box;
            }
        </style>
    </head>
    <body class="bg-black">
        <main class="min-h-screen flex items-center justify-center animate-gradient py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full p-8 glass-effect rounded-xl shadow-2xl gradient-border">
                <div class="mb-8">
                    <h2 class="text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mb-2">
                        Admin Access
                    </h2>
                    <p class="text-center text-sm text-gray-300">
                        Enter admin password to continue
                    </p>
                </div>
                <form method="post" action="/admin-login" class="space-y-6">
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-300 mb-1">Admin Password</label>
                        <input id="password" name="password" type="password" required 
                            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white bg-gray-700/50 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm transition-all duration-300" 
                            placeholder="Enter admin password">
                    </div>
                    <button type="submit" 
                        class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 shadow-lg hover:shadow-orange-500/20">
                        Access Admin Panel
                    </button>
                </form>
            </div>
        </main>
    </body>
    </html>
    """

@app.post("/admin-login")
async def admin_login(password: str = Form(...)):
    if password == ADMIN_PASSWORD:
        response = RedirectResponse("/admin-panel", status_code=302)
        response.set_cookie("admin_access", "granted", httponly=True, max_age=3600)  # 1 hour
        return response
    return HTMLResponse("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Denied - Student Registry</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .animate-gradient {
                background: linear-gradient(270deg, #000000, #1a1a1a, #000000);
                background-size: 600% 600%;
                animation: gradientBG 10s ease infinite;
            }
            @keyframes gradientBG {
                0% { background-position: 0% 50% }
                50% { background-position: 100% 50% }
                100% { background-position: 0% 50% }
            }
        </style>
    </head>
    <body class="bg-black">
        <main class="min-h-screen flex items-center justify-center animate-gradient py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full p-8 bg-gray-900/80 rounded-xl shadow-2xl border border-red-500">
                <div class="text-center">
                    <h2 class="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
                    <p class="text-gray-300 mb-6">Incorrect password. Please try again.</p>
                    <a href="/admin-login" class="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded transition-colors duration-200">
                        Try Again
                    </a>
                </div>
            </div>
        </main>
    </body>
    </html>
    """, status_code=401)

if __name__ == "__main__":
    from database import get_db, insert_fake_students
    db = next(get_db())
    insert_fake_students(db)
    print("Inserted fake students.")
