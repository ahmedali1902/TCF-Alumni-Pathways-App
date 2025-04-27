from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from datetime import datetime, timezone
from enum import IntEnum
from .objectid import PydanticObjectId

class UserRole(IntEnum):
    ADMIN = 1
    USER = 2

class UserModel(BaseModel):
    id: Optional[PydanticObjectId] = Field(None, alias="_id")
    email: Optional[EmailStr] = None
    password_hash: Optional[str] = None
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    device_id: Optional[str] = Field(None, min_length=1, max_length=50)
    role: UserRole = Field(default=UserRole.USER)
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="after")
    def validate_user_fields(self) -> 'UserModel':
        if self.role in {UserRole.ADMIN}:
            if not self.email or not self.password_hash:
                raise ValueError("Email and password are required for Admin users.")
        elif self.role == UserRole.USER:
            if not self.device_id:
                raise ValueError("Device ID is required for normal User.")
        return self

    def to_json(self):
        return self.model_dump_json(exclude_none=True)

    def to_bson(self):
        data = self.model_dump(by_alias=True, exclude_none=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data

    def update(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.now(timezone.utc)
