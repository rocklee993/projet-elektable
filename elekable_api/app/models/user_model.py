from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True, nullable=False)
    name: str
    email: str
    password: str  # Stocker le mot de passe hashé
    wallet_balance: Decimal = Field(default=0.0, nullable=False)

    address_id: Optional[UUID] = Field(default=None, foreign_key="address.id")  # Référence vers Address

# ✅ Définition différée des relations (évite l'import circulaire)
setattr(User, "transactions", Relationship(back_populates="buyer", sa_relationship_kwargs={"foreign_keys": "EnergyTransaction.buyer_id"}))
setattr(User, "invoices", Relationship(back_populates="user"))
