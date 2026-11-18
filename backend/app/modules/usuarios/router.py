from fastapi import APIRouter, Depends
from app.core.deps import get_usuario_service, solo_admin
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Admin usuarios"],
    dependencies=[Depends(solo_admin)],
)


@router.get("", response_model=list[UserPublic])
def listar_usuarios(service: UsuarioService = Depends(get_usuario_service)):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    current_user: UserPublic = Depends(solo_admin),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.desactivar(usuario_id, current_user.id)