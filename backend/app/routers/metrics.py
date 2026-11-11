from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.schemas import MetricsResponse
from app.auth import get_current_admin_user

router = APIRouter(prefix="/api/metrics", tags=["Dashboard Metrics"])

@router.get("", response_model=MetricsResponse)
def get_metrics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    total_users = db.query(User).count()
    program_coordinators = db.query(User).filter(User.role == UserRole.PROGRAM_COORDINATOR).count()
    faculty = db.query(User).filter(User.role == UserRole.FACULTY).count()
    students = db.query(User).filter(User.role == UserRole.STUDENT).count()

    return MetricsResponse(
        totalUsers=total_users,
        programCoordinators=program_coordinators,
        faculty=faculty,
        students=students,
    )
