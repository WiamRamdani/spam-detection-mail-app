from sqlalchemy import Boolean, create_engine, Column, Integer, String, Float, Text, ForeignKey, DateTime
from datetime import datetime, timezone
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("Set DATABASE_URL in backend/.env")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    full_name = Column(String(60), nullable=True)
    avatar = Column(Text, nullable=True)  # base64
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    
    emails_sent = relationship("Email", foreign_keys="Email.sender_id")
    emails_received = relationship("Email", foreign_keys="Email.receiver_id")
    
    
class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String(255))
    body = Column(Text)
    prediction = Column(Integer)  # 0 = ham, 1 = spam
    probability = Column(Float)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    feedback = Column(Integer, default=0)  # 1 = corrigé par user
    
    deleted = Column(Boolean, default=False)