from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import auth
from database import get_db
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str
    lastName: str
    firstName: str
    middleInitial: str | None = None
    course: str
    year: int
    gender: str
    graduating: bool = False

class UserLogin(BaseModel):
    email: str
    password: str
    remember: bool = False

@router.options("/register")
async def register_options():
    return {}  # Return empty response for OPTIONS request

@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        lastName=user.lastName,
        firstName=user.firstName,
        middleInitial=user.middleInitial,
        course=user.course,
        year=user.year,
        gender=user.gender,
        hashed_password=hashed_password,
        graduating=user.graduating
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {"message": "User registered successfully"}

@router.options("/login")
async def login_options():
    return {}  # Return empty response for OPTIONS request

@router.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Verify password
    if not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Generate token
    access_token_expires = None
    if user.remember:
        access_token_expires = timedelta(days=7)  # Remember for 7 days
    
    access_token = auth.create_access_token(
        data={"sub": db_user.email},
        expires_delta=access_token_expires
    )

    return {
        "token": access_token,
        "token_type": "bearer"
    }
