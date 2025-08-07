from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get the absolute path to the database file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "student_registry.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# Create engine with proper connection arguments for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for declarative models
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def insert_fake_students(db):
    from models import User
    import random
    first_names = ["John", "Jane", "Alex", "Emily", "Chris", "Katie", "Michael", "Sarah", "David", "Laura"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Lopez"]
    courses = ["BSIT", "BSCS", "BSIS", "BSCE"]
    genders = ["Male", "Female", "Other"]
    for i in range(1, 21):
        first = random.choice(first_names)
        last = random.choice(last_names)
        email = f"{first.lower()}.{last.lower()}{i}@example.com"
        user = User(
            email=email,
            lastName=last,
            firstName=first,
            middleInitial=chr(65 + (i % 26)),
            course=random.choice(courses),
            year=random.randint(1, 4),
            gender=random.choice(genders),
            hashed_password="fakehashedpassword",
            graduating=random.choice([True, False])
        )
        db.add(user)
    db.commit()
