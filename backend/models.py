from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    lastName = Column(String)
    firstName = Column(String)
    middleInitial = Column(String, nullable=True)
    course = Column(String)
    year = Column(Integer)
    gender = Column(String)
    hashed_password = Column(String)
    graduating = Column(Boolean, default=False)
