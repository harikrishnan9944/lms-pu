from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models import UserRole, UserStatus

class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email address or username")
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    username: str
    role: UserRole
    status: UserStatus
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE

class UserUpdateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    role: UserRole
    status: UserStatus

class StatusUpdateRequest(BaseModel):
    status: UserStatus

class PasswordResetRequest(BaseModel):
    newPassword: str = Field(..., min_length=6)

class MetricsResponse(BaseModel):
    totalUsers: int
    programCoordinators: int
    faculty: int
    students: int

class PaginatedUsersResponse(BaseModel):
    users: List[UserResponse]
    totalCount: int
    totalPages: int
    currentPage: int
