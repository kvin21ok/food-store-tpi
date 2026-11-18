from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import get_current_active_user, solo_admin
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _traducir(error: Exception) -> HTTPException:
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, detail=str(error))
    return HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(error))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.crear(data, usuario.id)
    except (ProductoNoEncontrado, ReglaDeNegocio) as error:
        raise _traducir(error) from error


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = None,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.listar(usuario, estado, skip, limit)


@router.get("/resumen", response_model=ResumenPedidos, dependencies=[Depends(solo_admin)])
def resumen_pedidos(service: PedidoService = Depends(get_pedido_service)):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.obtener(pedido_id, usuario)
    except (PedidoNoEncontrado, PedidoAjeno) as error:
        raise _traducir(error) from error


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    dependencies=[Depends(solo_admin)],
)
def cambiar_estado(
    pedido_id: int,
    data: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except (PedidoNoEncontrado, ReglaDeNegocio) as error:
        raise _traducir(error) from error


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    try:
        return service.cancelar_propio(pedido_id, usuario.id)
    except (PedidoNoEncontrado, PedidoAjeno, ReglaDeNegocio) as error:
        raise _traducir(error) from error