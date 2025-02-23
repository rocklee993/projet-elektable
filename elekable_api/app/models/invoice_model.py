from datetime import datetime
from decimal import Decimal
from typing import Optional

from uuid import UUID, uuid4
from sqlmodel import SQLModel, Relationship, Field

from app.models.transaction_model import EnergyTransaction
from app.models.user_model import User


class Invoice(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True, nullable=False)
    transaction_id: UUID = Field(foreign_key="transaction.id")
    user_id: UUID = Field(foreign_key="user.id")  # Facture liée à l'utilisateur

    amount: Decimal
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    pdf_link: str

    # Relations
    transaction: Optional[EnergyTransaction] = Relationship(back_populates="invoice")
    user: Optional[User] = Relationship(back_populates="invoices")
