import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.models import User, UserRole, UserStatus
from app.schemas import (
    UserResponse,
    UserCreateRequest,
    UserUpdateRequest,
    StatusUpdateRequest,
    PasswordResetRequest,
    PaginatedUsersResponse,
)
from app.auth import get_current_admin_user, hash_password

router = APIRouter(prefix="/api/users", tags=["Users Management"])

@router.get("", response_model=PaginatedUsersResponse)
def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query("ALL"),
    status_param: Optional[str] = Query("ALL", alias="status"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    query = db.query(User)

    if search and search.strip():
        s = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(User.name).like(s),
                func.lower(User.email).like(s),
                func.lower(User.username).like(s),
            )
        )

    if role and role != "ALL":
        query = query.filter(User.role == role)

    if status_param and status_param != "ALL":
        query = query.filter(User.status == status_param)

    total_count = query.count()
    users = (
        query.order_by(User.createdAt.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1

    return PaginatedUsersResponse(
        users=users,
        totalCount=total_count,
        totalPages=total_pages,
        currentPage=page,
    )

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    request: UserCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    if request.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Direct Admin account creation is restricted."
        )

    clean_email = request.email.strip().lower()
    clean_username = request.username.strip().lower()

    # Check duplicate email
    if db.query(User).filter(func.lower(User.email) == clean_email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Check duplicate username
    if db.query(User).filter(func.lower(User.username) == clean_username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This username is already taken."
        )

    hashed_pw = hash_password(request.password)

    new_user = User(
        name=request.name.strip(),
        email=clean_email,
        username=clean_username,
        passwordHash=hashed_pw,
        role=request.role,
        status=request.status,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    request: UserUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    clean_email = request.email.strip().lower()
    clean_username = request.username.strip().lower()

    # Check duplicate email if changed
    existing_email = db.query(User).filter(
        func.lower(User.email) == clean_email, User.id != user_id
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Another account is already using this email."
        )

    # Check duplicate username if changed
    existing_username = db.query(User).filter(
        func.lower(User.username) == clean_username, User.id != user_id
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Another account is already using this username."
        )

    user.name = request.name.strip()
    user.email = clean_email
    user.username = clean_username
    user.role = request.role
    user.status = request.status

    db.commit()
    db.refresh(user)

    return user

@router.patch("/{user_id}/status", response_model=UserResponse)
def toggle_status(
    user_id: str,
    request: StatusUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    user.status = request.status
    db.commit()
    db.refresh(user)

    return user

@router.post("/{user_id}/reset-password")
def reset_password(
    user_id: str,
    request: PasswordResetRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    user.passwordHash = hash_password(request.newPassword)
    db.commit()

    return {"message": "Password successfully reset.", "success": True}
