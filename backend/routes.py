from fastapi import APIRouter, Depends, HTTPException, status, Path, Request
from sqlalchemy.orm import Session
from . import models
from . import auth
from .database import get_db
from pydantic import BaseModel
from datetime import timedelta
from typing import Optional
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except auth.JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

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

class UserUpdate(BaseModel):
    lastName: str
    firstName: str
    middleInitial: Optional[str] = None
    course: str
    year: int
    gender: str
    graduating: bool = False

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

@router.get("/user/profile")
async def get_user_profile(current_user: models.User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "lastName": current_user.lastName,
        "firstName": current_user.firstName,
        "middleInitial": current_user.middleInitial,
        "course": current_user.course,
        "year": current_user.year,
        "gender": current_user.gender,
        "graduating": current_user.graduating
    }

@router.put("/user/update")
async def update_user_profile(
    user_update: UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Update user information
    current_user.lastName = user_update.lastName
    current_user.firstName = user_update.firstName
    current_user.middleInitial = user_update.middleInitial
    current_user.course = user_update.course
    current_user.year = user_update.year
    current_user.gender = user_update.gender
    current_user.graduating = user_update.graduating

    try:
        db.commit()
        db.refresh(current_user)
        return {"message": "Profile updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

# Admin: Get all students
@router.get("/admin/students")
async def get_all_students(request: Request, db: Session = Depends(get_db)):
    if request.cookies.get("admin_access") != "granted":
        raise HTTPException(status_code=401, detail="Admin access required")
    students = db.query(models.User).all()
    return [
        {
            "id": s.id,
            "email": s.email,
            "lastName": s.lastName,
            "firstName": s.firstName,
            "middleInitial": s.middleInitial,
            "course": s.course,
            "year": s.year,
            "gender": s.gender,
            "graduating": s.graduating
        }
        for s in students
    ]

# Admin: Get a single student by ID
@router.get("/admin/students/{student_id}")
async def get_student(request: Request, student_id: int = Path(...), db: Session = Depends(get_db)):
    if request.cookies.get("admin_access") != "granted":
        raise HTTPException(status_code=401, detail="Admin access required")
    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "id": student.id,
        "email": student.email,
        "lastName": student.lastName,
        "firstName": student.firstName,
        "middleInitial": student.middleInitial,
        "course": student.course,
        "year": student.year,
        "gender": student.gender,
        "graduating": student.graduating
    }

# Admin: Update a student by ID
class StudentUpdate(BaseModel):
    lastName: str
    firstName: str
    middleInitial: str | None = None
    course: str
    year: int
    gender: str
    graduating: bool = False

@router.put("/admin/students/{student_id}")
async def update_student(request: Request, student_id: int, student_update: StudentUpdate, db: Session = Depends(get_db)):
    if request.cookies.get("admin_access") != "granted":
        raise HTTPException(status_code=401, detail="Admin access required")
    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.lastName = student_update.lastName
    student.firstName = student_update.firstName
    student.middleInitial = student_update.middleInitial
    student.course = student_update.course
    student.year = student_update.year
    student.gender = student_update.gender
    student.graduating = student_update.graduating
    db.commit()
    db.refresh(student)
    return {"message": "Student updated successfully"}

# Admin: Delete a student by ID
@router.delete("/admin/students/{student_id}")
async def delete_student(request: Request, student_id: int, db: Session = Depends(get_db)):
    if request.cookies.get("admin_access") != "granted":
        raise HTTPException(status_code=401, detail="Admin access required")
    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}
