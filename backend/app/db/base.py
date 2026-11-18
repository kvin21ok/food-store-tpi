# Importa todos los modelos para que SQLModel los registre
# antes de crear las tablas o de usar las relaciones
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario