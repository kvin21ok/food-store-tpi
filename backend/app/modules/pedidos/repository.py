from datetime import datetime
from sqlmodel import col, func, select
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def refrescar(self, pedido: Pedido) -> Pedido:
        self.session.refresh(pedido)
        return pedido

    def _listar(self, filtros: list, skip: int, limit: int) -> tuple[list[Pedido], int]:
        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()
        items = list(
            self.session.exec(
                select(Pedido)
                .where(*filtros)
                .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
                .offset(skip)
                .limit(limit)
            ).all()
        )
        return items, total

    def list_by_usuario(
        self, usuario_id: int, estado: str | None, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        filtros = [col(Pedido.usuario_id) == usuario_id]
        if estado:
            filtros.append(col(Pedido.estado) == estado)
        return self._listar(filtros, skip, limit)

    def list_todos(
        self, estado: str | None, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        filtros = []
        if estado:
            filtros.append(col(Pedido.estado) == estado)
        return self._listar(filtros, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(
            select(col(Pedido.estado), func.count()).group_by(col(Pedido.estado))
        ).all()
        return {estado: total for estado, total in filas}

    def count_hoy(self) -> int:
        inicio = datetime.now().astimezone().replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(col(Pedido.created_at) >= inicio)
        ).one()

    def sum_ingresos_entregados(self) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(col(Pedido.total)), 0)).where(
                col(Pedido.estado) == "ENTREGADO"
            )
        ).one()
        return float(total)


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    model = DetallePedido