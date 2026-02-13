from fastapi import Depends, Request                                                                                                                                                                                                                     
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select                                                                                                                                                                                                                            
from jose import jwt, JWTError  
from database.connection import get_db
from database.orm import User
import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    token = request.cookies.get("tubetext_token")
    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        return None

    if not user_id:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()