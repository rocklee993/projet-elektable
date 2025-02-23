from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Relationship

class EnergyTransaction(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True, nullable=False)
    buyer_id: UUID = Field(foreign_key="user.id")
    seller_id: UUID = Field(foreign_key="user.id")
    offer_id: UUID = Field(foreign_key="offer.id")  # Suppose un modèle Offer existe

    quantity_kwh: Decimal
    total_price: Decimal
    transaction_date: datetime = Field(default_factory=datetime.utcnow)

# ✅ Définition différée des relations pour éviter les erreurs
setattr(EnergyTransaction, "buyer", Relationship(back_populates="transactions", sa_relationship_kwargs={"foreign_keys": "EnergyTransaction.buyer_id"}))
setattr(EnergyTransaction, "seller", Relationship(sa_relationship_kwargs={"foreign_keys": "EnergyTransaction.seller_id"}))
setattr(EnergyTransaction, "invoice", Relationship(back_populates="transaction"))
