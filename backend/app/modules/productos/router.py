from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import solo_admin
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


def _no_encontrado(error: Exception) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, detail=str(error))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int, service: ProductoService = Depends(get_producto_service)
):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as error:
        raise _no_encontrado(error) from error


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(solo_admin)],
)
def crear_producto(
    data: ProductoCreate, service: ProductoService = Depends(get_producto_service)
):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as error:
        raise _no_encontrado(error) from error


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(solo_admin)],
)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise _no_encontrado(error) from error


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(solo_admin)],
)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as error:
        raise _no_encontrado(error) from error


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(solo_admin)],
)
def eliminar_producto(
    producto_id: int, service: ProductoService = Depends(get_producto_service)
):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as error:
        raise _no_encontrado(error) from error