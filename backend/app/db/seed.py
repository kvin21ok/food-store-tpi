import app.db.base
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"


def seed_admin() -> None:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username(ADMIN_USERNAME):
            print(f"El usuario '{ADMIN_USERNAME}' ya existe. No se hizo nada.")
            return
        uow.usuarios.add(
            Usuario(
                username=ADMIN_USERNAME,
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password(ADMIN_PASSWORD),
                role="admin",
            )
        )
        print(f"Usuario '{ADMIN_USERNAME}' creado.")


if __name__ == "__main__":
    create_all_tables()
    seed_admin()