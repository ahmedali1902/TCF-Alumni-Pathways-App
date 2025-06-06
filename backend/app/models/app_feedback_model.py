from datetime import datetime, timezone
from enum import IntEnum
from typing import Optional

from fastapi.encoders import jsonable_encoder
from pydantic.v1 import BaseModel, Field

from .objectid import PydanticObjectId


class ReasonType(IntEnum):
    GENERAL = 1
    COMPLAINT = 2
    SUGGESTION = 3
    OTHER = 4


class AppFeedbackModel(BaseModel):
    id: Optional[PydanticObjectId] = Field(None, alias="_id")
    user_name: Optional[str] = Field(None)
    reason_type: ReasonType = Field(default=ReasonType.GENERAL)
    reason_if_other: str = Field(default="")
    experience_rating: int = Field(default=0, ge=0, le=5)
    is_tcf_alumni: bool = Field(default=False)
    whatsapp_number: Optional[str] = Field(None)
    feedback_text: Optional[str] = Field(None)
    processed: bool = Field(default=False)
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
