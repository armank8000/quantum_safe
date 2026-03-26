"""
Run this once to create the demo user.
Command: python scripts/seed_users.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    db = SessionLocal()
    existing = db.query(User).filter(User.email == "hackathon_user@pnb.bank.in").first()
    if existing:
        print("User already exists — skipping")
        db.close()
        return

    user = User(
        email="hackathon_user@pnb.bank.in",
        username="hackathon_user",
        hashed_password=pwd_context.hash("password123"),
        role="admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    print("Created user: hackathon_user@pnb.bank.in / password123")
    db.close()

if __name__ == "__main__":
    seed()
