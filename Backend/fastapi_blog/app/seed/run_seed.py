from app.database.session import SessionLocal

from app.seed.seed_database import (
    seed_database,
)


def main():

    db = SessionLocal()

    try:

        seed_database(db)

    finally:

        db.close()


if __name__ == "__main__":

    main()
