from sqlalchemy import Boolean, Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    last_name = Column(String)
    first_name = Column(String)
    middle_initial = Column(String, nullable=True)
    course = Column(String)
    year = Column(Integer)
    graduating = Column(Boolean, default=False)
    gender = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
