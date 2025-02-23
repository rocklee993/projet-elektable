from passlib.context import CryptContext
from sqlmodel import Session
from app.models.address_model import Address
from app.models.user_model import User
from app.schemas.address_schema import AddressRead
from app.schemas.user_schema import UserCreate, UserRead

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_email(session: Session, email: str):
    from sqlmodel import select
    return session.exec(select(User).where(User.email == email)).first()


def create_user(session: Session, user_data: UserCreate):

    # Vérifie si l'email est déjà utilisé
    existing_user = get_user_by_email(session, user_data.email)
    if existing_user:
        raise ValueError("Cet email est déjà utilisé")

    hashed_password = pwd_context.hash(user_data.password)

    # ✅ Créer l'adresse
    address = Address(
        street=user_data.address.street,
        city=user_data.address.city,
        postal_code=user_data.address.postal_code,
        country=user_data.address.country
    )
    session.add(address)
    session.commit()
    session.refresh(address)

    # ✅ Créer l'utilisateur
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        address_id=address.id
    )
    session.add(user)
    session.commit()
    session.refresh(user)


    address_read = AddressRead(
        id=address.id,
        street=address.street,
        city=address.city,
        postal_code=address.postal_code,
        country=address.country
    )
    user_read = UserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        wallet_balance=user.wallet_balance,
        address=address_read # ✅ Adresse maintenant convertie
    )

    return user_read


def authenticate_user(session: Session, email: str, password: str):
    user = get_user_by_email(session, email)
    if not user:
        raise ValueError("Utilisateur non trouvé")

    # Vérifier le mot de passe
    if not pwd_context.verify(password, user.password):
        raise ValueError("Mot de passe incorrect")

    return user
