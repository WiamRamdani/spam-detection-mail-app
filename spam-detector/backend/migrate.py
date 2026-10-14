from sqlalchemy import text
from database import engine


with engine.connect() as conn:
    conn.execute(text("ALTER TABLE emails ADD COLUMN deleted BOOLEAN DEFAULT 0"))
    conn.commit()

print("Migration done")