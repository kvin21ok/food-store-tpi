from app.core.utils import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

# Mapa de transiciones válidas
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("No tenés permiso para acceder a este pedido")


class ReglaDeNegocio(Exception):
    """Base de las reglas de negocio que responden 400."""


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self) -> None:
        super().__init__("Un producto no puede repetirse en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}' (disponible: {stock})")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"No se puede pasar de {actual} a {nuevo}")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_activo(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.pedidos.refrescar(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, estado: str | None, skip: int, limit: int
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                pedidos, total = uow.pedidos.list_todos(estado, skip, limit)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(
                    usuario.id, estado, skip, limit
                )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(pedido.estado, nuevo_estado)
            return self._aplicar_estado(uow, pedido, nuevo_estado)


    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(pedido.estado, "CANCELADO")
            return self._aplicar_estado(uow, pedido, "CANCELADO")

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.sum_ingresos_entregados(),
            )

    def _aplicar_estado(
        self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str
    ) -> PedidoRead:
        if nuevo_estado == "CANCELADO":
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto is not None:
                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo_estado
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)
        uow.pedidos.refrescar(pedido)
        return PedidoRead.model_validate(pedido)