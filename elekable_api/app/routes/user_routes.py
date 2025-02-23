from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.exceptions import NotFoundException
from app.schemas.user_schema import UserCreate, UserRead
from app.services.user_services import authenticate_user, create_user

router = APIRouter(prefix="/users", tags=["Users"])


# Route d'inscription
@router.post("/register", response_model=UserRead)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    try:
        return create_user(session, user_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# Route de connexion
@router.post("/login", response_model=UserRead)
def login(email: str, password: str, session: Session = Depends(get_session)):
    try:
        return authenticate_user(session, email, password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
