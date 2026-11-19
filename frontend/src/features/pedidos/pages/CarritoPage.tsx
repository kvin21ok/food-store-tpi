import { Link } from "react-router-dom";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { CLASE_LINK_BOTON } from "../../../shared/ui/estilos";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";

export default function CarritoPage() {
    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total);
    const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
    const quitar = useCartStore((state) => state.quitar);
    const vaciar = useCartStore((state) => state.vaciar);

    if (items.length === 0) {
        return (
            <EstadoVacio titulo="Tu carrito está vacío" descripcion="Agregá productos desde el catálogo.">
                <Link to="/" className={CLASE_LINK_BOTON}>
                    Ir al catálogo
                </Link>
            </EstadoVacio>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Carrito</h1>

            <div className="space-y-3">
                {items.map((item) => (
                    <Card key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
                        <div className="min-w-40 flex-1">
                            <p className="font-medium">{item.nombre}</p>
                            <p className="text-sm text-slate-500">
                                {formatearPrecio(item.precio_unitario)} c/u
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variante="secundario"
                                aria-label={`Quitar una unidad de ${item.nombre}`}
                                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                            >
                                −
                            </Button>
                            <span className="w-8 text-center text-sm">{item.cantidad}</span>
                            <Button
                                variante="secundario"
                                aria-label={`Agregar una unidad de ${item.nombre}`}
                                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                            >
                                +
                            </Button>
                        </div>

                        <p className="w-28 text-right font-semibold">
                            {formatearPrecio(item.precio_unitario * item.cantidad)}
                        </p>

                        <Button variante="peligro" onClick={() => quitar(item.producto_id)}>
                            Quitar
                        </Button>
                    </Card>
                ))}
            </div>

            <Card className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-2xl font-bold">{formatearPrecio(total())}</p>
                    <p className="text-xs text-slate-500">
                        El precio final se confirma al realizar el pedido.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variante="secundario" onClick={vaciar}>
                        Vaciar carrito
                    </Button>
                    <Link to="/checkout" className={CLASE_LINK_BOTON}>
                        Confirmar pedido
                    </Link>
                </div>
            </Card>
        </div>
    );
}