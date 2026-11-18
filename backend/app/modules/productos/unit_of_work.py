from sqlmodel import Session
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    categorias: CategoriaRepository
    productos: ProductoRepository

    def _init_repositories(self, session: Session) -> None:
        self.categorias = CategoriaRepository(session)
        self.productos = ProductoRepository(session)