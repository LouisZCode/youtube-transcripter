from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

import os
from dotenv import load_dotenv
load_dotenv()

database_url = os.getenv("DATABASE_URL")

engine = create_async_engine(database_url)
SessionLocal = async_sessionmaker(bind=engine, autoflush=False, autocommit=False)

async def get_db():
    async with SessionLocal() as db:
        yield db
