from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel
from app.core.utils import utcnow
if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE")
    forma_pago: str
    direccion_entrega: str
    notas: str | None = Field(default=None)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")