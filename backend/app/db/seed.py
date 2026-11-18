from urllib.parse import quote_plus
from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
import app.db.base

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"

# categoría -> (descripción, [(nombre, descripción, precio, stock)])
CATALOGO = {
    "Pizzas": (
        "Pizzas a la piedra",
        [
            ("Muzzarella", "Salsa de tomate y muzzarella", 8500.0, 20),
            ("Napolitana", "Muzzarella, tomate en rodajas y ajo", 9800.0, 15),
            ("Fugazzeta", "Cebolla y muzzarella", 9200.0, 12),
        ],
    ),
    "Bebidas": (
        "Gaseosas, aguas y cervezas",
        [
            ("Coca-Cola 500ml", "Gaseosa cola", 2500.0, 40),
            ("Agua mineral 500ml", "Sin gas", 1800.0, 40),
            ("Cerveza artesanal", "Rubia, 473ml", 4200.0, 25),
        ],
    ),
    "Postres": (
        "Dulces para cerrar la comida",
        [
            ("Flan con dulce de leche", "Con crema", 3800.0, 18),
            ("Tiramisú", "Receta clásica", 4500.0, 5),
            ("Brownie con helado", "Brownie tibio y helado de crema", 5200.0, 10),
        ],
    ),
}


def _imagen(nombre: str) -> str:
    return f"https://placehold.co/400x300?text={quote_plus(nombre)}"


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


def seed_catalogo() -> None:
    with ProductoUnitOfWork() as uow:
        for nombre_cat, (desc_cat, productos) in CATALOGO.items():
            categoria = uow.categorias.get_by_nombre(nombre_cat)
            if categoria is None:
                categoria = uow.categorias.add(
                    Categoria(nombre=nombre_cat, descripcion=desc_cat)
                )
                print(f"Categoría '{nombre_cat}' creada.")
            for nombre, descripcion, precio, stock in productos:
                if uow.productos.get_by_nombre(nombre):
                    continue
                uow.productos.add(
                    Producto(
                        categoria_id=categoria.id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=_imagen(nombre),
                        stock=stock,
                    )
                )
                print(f"Producto '{nombre}' creado.")


if __name__ == "__main__":
    create_all_tables()
    seed_admin()
    seed_catalogo()