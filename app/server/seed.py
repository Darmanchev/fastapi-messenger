import asyncio
from passlib.context import CryptContext
from app.server.db.database import SessionLocal, engine
from app.server.db.base import Base
from app.server.models import User, Channel, Message
from sqlalchemy import select

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    # 1. Создаем таблицы асинхронно
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # 2. Проверка на существующие данные
        result = await db.execute(select(User))
        if result.first():
            print("⚡ БД уже заполнена.")
            return

        # 3. Создаем пользователей (через список словарей для чистоты)
        user_data = [
            ("alice", "alice@test.com", "123456"),
            ("bob", "bob@test.com", "123456"),
            ("admin", "admin@test.com", "admin")
        ]
        users = [User(username=u, email=e, password_hash=pwd_context.hash(p)) for u, e, p in user_data]
        db.add_all(users)

        # 4. Создаем каналы
        channel_names = ["general", "random", "tech", "announcements", "design"]
        channels = [Channel(name=name) for name in channel_names]
        db.add_all(channels)

        # Сохраняем, чтобы получить ID для сообщений
        await db.commit()
        for obj in users + channels: await db.refresh(obj)

        # 5. Сообщения (используем объекты напрямую благодаря back_populates)
        messages = [
            Message(content="Привет всем! 👋", channel=channels[0], author=users[0]),
            Message(content="Рад быть здесь!", channel=channels[0], author=users[1]),
            Message(content="FastAPI лучше Flask.", channel=channels[2], author=users[1]),
            Message(content="🎉 BestMessenger запущен!", channel=channels[3], author=users[2]),
        ]
        db.add_all(messages)
        await db.commit()

    print("✅ БД успешно инициализирована демо-данными!")


if __name__ == "__main__":
    asyncio.run(seed())