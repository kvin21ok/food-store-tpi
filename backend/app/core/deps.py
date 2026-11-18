from typing import Callable
from fastapi import Depends, HTTPException, Request, status
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


def get_current_user(
    request: Request,
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
        )
    username = decode_access_token(token)
    usuario = service.obtener_por_username(username) if username else None
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    return usuario


def get_current_active_user(
    current_user: UserPublic = Depends(get_current_user),
) -> UserPublic:
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(roles: list[str]) -> Callable[..., UserPublic]:
    def verificar_rol(
        current_user: UserPublic = Depends(get_current_active_user),
    ) -> UserPublic:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return current_user

    return verificar_rol


solo_admin = require_role(["admin"])