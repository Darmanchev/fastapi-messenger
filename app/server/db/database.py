from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.server.core.config import settings

engine = create_async_engine(settings.DATABASE_URL)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()