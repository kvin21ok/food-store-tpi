from sqlmodel import col, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        # busca entre todas (incluso dadas de baja): la baja no libera el nombre
        return self.session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

    def get_activa(self, categoria_id: int) -> Categoria | None:
        categoria = self.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            return None
        return categoria

    def list_activas(self) -> list[Categoria]:
        consulta = (
            select(Categoria)
            .where(col(Categoria.activo).is_(True))
            .order_by(col(Categoria.id))
        )
        return list(self.session.exec(consulta).all())