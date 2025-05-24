from datetime import datetime, timezone
from typing import Optional

from fastapi.encoders import jsonable_encoder
from pydantic.v1 import BaseModel, Field

from .objectid import PydanticObjectId


class NotificationModel(BaseModel):
    id: Optional[PydanticObjectId] = Field(None, alias="_id")
    title: str = Field(None, min_length=1, max_length=100)
    content: str = Field(None, min_length=1, max_length=500)
    is_deleted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: PydanticObjectId = None
    updated_by: PydanticObjectId = None

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
