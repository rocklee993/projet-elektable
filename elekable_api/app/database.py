from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "mysql+pymysql://samuel:password@localhost/elekable"
engine = create_engine(DATABASE_URL, echo=True)


# Fonction pour récupérer une session
def get_session():
    with Session(engine) as session:
        yield session

# Initialisation de la BDD
def init_db():
    SQLModel.metadata.create_all(engine)
