from datetime import datetime, timezone
from enum import IntEnum
from typing import Optional

from bson import ObjectId
from fastapi.encoders import jsonable_encoder
from pydantic.v1 import BaseModel, Field

from .objectid import PydanticObjectId


class ManagingAuthority(IntEnum):
    PUBLIC = 1
    PRIVATE = 2


class Gender(IntEnum):
    MALE_ONLY = 1
    FEMALE_ONLY = 2
    COEDUCATION = 3


class InstituteFacultyModel(BaseModel):
    id: PydanticObjectId = Field(default_factory=ObjectId)
    name: str = Field(None, min_length=1, max_length=50)
    average_result_percentage_required: Optional[float] = Field(None, ge=0, le=100)
    gender: Gender = Field(default=Gender.COEDUCATION)


class GeoPointModel(BaseModel):
    type: str = Field(default="Point", const=True)
    coordinates: list[float] = Field(..., min_items=2, max_items=2)


class InstituteModel(BaseModel):
    id: Optional[PydanticObjectId] = Field(None, alias="_id")
    name: str = Field(None, min_length=1, max_length=256)
    managing_authority: ManagingAuthority = Field(default=ManagingAuthority.PUBLIC)
    location: GeoPointModel = Field(...)
    description: Optional[str] = Field("", max_length=1024)
    faculties: list[InstituteFacultyModel] = Field(default_factory=list)
    tcf_rating: float = Field(0.0, ge=0, le=5)
    approx_distance: Optional[float] = Field(None, ge=0)
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
