from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

CAMPOS_OBLIGATORIOS = {"categoria_id", "nombre", "precio_base", "stock", "disponible"}


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(
                search, categoria_id, disponible, skip, limit
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            return ProductoRead.model_validate(producto)

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            if uow.categorias.get_activa(data.categoria_id) is None:
                raise CategoriaNoEncontrada(data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)

            cambios = data.model_dump(exclude_unset=True)
            nueva_categoria = cambios.get("categoria_id")
            if nueva_categoria is not None:
                if uow.categorias.get_activa(nueva_categoria) is None:
                    raise CategoriaNoEncontrada(nueva_categoria)

            for campo, valor in cambios.items():
                if valor is None and campo in CAMPOS_OBLIGATORIOS:
                    continue
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_activo(producto_id)
            if producto is None:
                raise ProductoNoEncontrado(producto_id)
            producto.activo = False
            uow.productos.add(producto)