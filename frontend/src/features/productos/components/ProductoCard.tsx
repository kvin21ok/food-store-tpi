import { useState } from "react";
import { formatearPrecio } from "../../../shared/utils/formato";
import Button from "../../../shared/ui/Button";
import { useCartStore } from "../../../store/cartStore";
import type { Producto } from "../types/producto";

export default function ProductoCard({ producto }: { producto: Producto }) {
    const agregar = useCartStore((state) => state.agregar);
    const [agregado, setAgregado] = useState(false);
    const [imagenRota, setImagenRota] = useState(false);

    const sinStock = producto.stock <= 0;
    const vendible = producto.disponible && !sinStock;

    let estado = `Stock: ${producto.stock}`;
    if (sinStock) estado = "Sin stock";
    else if (!producto.disponible) estado = "No disponible";

    function handleAgregar() {
        agregar({
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_base,
        });
        setAgregado(true);
        window.setTimeout(() => setAgregado(false), 1500);
    }

    return (
        <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {producto.imagen_url && !imagenRota ? (
                <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="h-40 w-full object-cover"
                    onError={() => setImagenRota(true)}
                />
            ) : (
                <div className="flex h-40 items-center justify-center bg-slate-100 text-sm text-slate-400">
                    Sin imagen
                </div>
                )}

            <div className="flex flex-1 flex-col gap-2 p-4">
                {producto.categoria && (
                    <span className="text-xs font-medium uppercase tracking-wide text-orange-600">
                        {producto.categoria.nombre}
                    </span>
                )}
                <h3 className="font-semibold">{producto.nombre}</h3>
                {producto.descripcion && (
                    <p className="text-sm text-slate-600">{producto.descripcion}</p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</span>
                    <span className={`text-xs ${vendible ? "text-slate-500" : "text-red-600"}`}>
                        {estado}
                    </span>
                </div>

                <Button disabled={!vendible} onClick={handleAgregar}>
                    {agregado ? "Agregado ✓" : "Agregar al carrito"}
                </Button>
            </div>
        </article>
    );
}