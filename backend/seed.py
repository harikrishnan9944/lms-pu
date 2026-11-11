import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.models import User, UserRole, UserStatus
from app.auth import hash_password

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding default LMS users...")
        
        default_pw = hash_password("Password@123")
        admin_pw = hash_password("Admin@123456")
        
        users_to_seed = [
            {
                "id": "usr_admin_1",
                "name": "Hari (Admin)",
                "email": "admin@lms.edu",
                "username": "admin",
                "passwordHash": admin_pw,
                "role": UserRole.ADMIN,
                "status": UserStatus.ACTIVE,
            },
            {
                "id": "usr_coord_1",
                "name": "Priya Sharma",
                "email": "priya@lms.edu",
                "username": "priya_coord",
                "passwordHash": default_pw,
                "role": UserRole.PROGRAM_COORDINATOR,
                "status": UserStatus.ACTIVE,
            },
            {
                "id": "usr_fac_1",
                "name": "Arun Kumar",
                "email": "arun@lms.edu",
                "username": "arunkumar",
                "passwordHash": default_pw,
                "role": UserRole.FACULTY,
                "status": UserStatus.ACTIVE,
            },
            {
                "id": "usr_stud_1",
                "name": "Karthik Raja",
                "email": "karthik@lms.edu",
                "username": "karthik",
                "passwordHash": default_pw,
                "role": UserRole.STUDENT,
                "status": UserStatus.ACTIVE,
            },
            {
                "id": "usr_stud_2",
                "name": "Ananya Roy",
                "email": "ananya@lms.edu",
                "username": "ananya",
                "passwordHash": default_pw,
                "role": UserRole.STUDENT,
                "status": UserStatus.ACTIVE,
            },
        ]
        
        seeded_count = 0
        for u in users_to_seed:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                user_obj = User(**u)
                db.add(user_obj)
                seeded_count += 1
                print(f" -> Added: {u['name']} ({u['username']} - {u['role'].value})")
            else:
                print(f" -> Exists: {u['name']} ({u['username']})")
                
        db.commit()
        print(f"\nDatabase seeding completed! {seeded_count} new users created.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
