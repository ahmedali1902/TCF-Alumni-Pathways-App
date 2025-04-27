from fastapi.encoders import jsonable_encoder
from pydantic.v1 import BaseModel, EmailStr, Field
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
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_json(self):
        return jsonable_encoder(self, by_alias=True, exclude_none=True)

    def to_bson(self):
        data = self.dict(by_alias=True, exclude_none=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data

    def update(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.now(timezone.utc)
