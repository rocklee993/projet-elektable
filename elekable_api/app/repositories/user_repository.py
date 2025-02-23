from sqlmodel import Session, select
from app.models.user_model import User

def get_user_by_email(session: Session, email: str):
    return session.exec(select(User).where(User.email == email)).first()
