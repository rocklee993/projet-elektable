from typing import Optional

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class Address(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True, nullable=False)
    street: str
    city: str
    postal_code: str
    country: str = "France"  # Par défaut, c'est en France
