# Schéma pour la création d'un User
from decimal import Decimal
from typing import Optional
from uuid import UUID


from pydantic import BaseModel, EmailStr

from app.schemas.address_schema import AddressCreate, AddressRead


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str  # Sera hashé avant stockage
    address: AddressCreate  # On attend un objet AddressCreate

# Schéma pour renvoyer un User après création/authentification
class UserRead(BaseModel):
    id: UUID
    name: str
    email: str
    wallet_balance: Decimal
    address: Optional[AddressRead]  # Peut être null si pas d'adresse associée