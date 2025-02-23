# Schéma pour l'adresse
from uuid import UUID

from pydantic import BaseModel


class AddressCreate(BaseModel):
    street: str
    city: str
    postal_code: str
    country: str = "France"

class AddressRead(BaseModel):
    id: UUID
    street: str
    city: str
    postal_code: str
    country: str
