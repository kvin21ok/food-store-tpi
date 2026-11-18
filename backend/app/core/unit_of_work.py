from typing import Callable, TypeVar
from sqlmodel import Session
from app.core.database import session_factory as default_session_factory

UoWT = TypeVar("UoWT", bound="UnitOfWork")


class UnitOfWork:
    """Unit of Work base: abre la sesión en __enter__ y hace commit,
    rollback y close en __exit__. Nadie más llama a commit()."""

    def __init__(
        self, session_factory: Callable[[], Session] = default_session_factory
    ) -> None:
        self._session_factory = session_factory
        self.session: Session | None = None

    def __enter__(self: UoWT) -> UoWT:
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
            self.session = None
        return False

    def _init_repositories(self, session: Session) -> None:
        """Cada módulo crea acá sus repositorios."""