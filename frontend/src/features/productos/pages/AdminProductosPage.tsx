import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Skeleton from "../../../shared/components/Skeleton";
import Button from "../../../shared/ui/Button";
import { formatearPrecio } from "../../../shared/utils/formato";
import ProductoFormModal from "../components/ProductoFormModal";
import StockModal from "../components/StockModal";
import { useEliminarProducto, useProductos } from "../hooks/useProductos";
import type { Producto } from "../types/producto";

type ModalProducto =
    | { tipo: "formulario"; producto: Producto | null }
    | { tipo: "stock"; producto: Producto };

export default function AdminProductosPage() {
    // el panel pide limit=100 y pagina del lado del cliente
    const productos = useProductos({ skip: 0, limit: 100 });
    const eliminar = useEliminarProducto();
    const [modal, setModal] = useState<ModalProducto | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleEliminar(producto: Producto) {
        if (!window.confirm(`¿Dar de baja el producto "${producto.nombre}"?`)) return;
        setError(null);
        eliminar.mutate(producto.id, {
            onError: (e) => setError(handleApiError(e, "No se pudo dar de baja el producto")),
        });
    }

    const columnas: ColumnDef<Producto>[] = [
        { id: "nombre", header: "Producto", cell: ({ row }) => row.original.nombre },
        {
            id: "categoria",
            header: "Categoría",
            cell: ({ row }) => row.original.categoria?.nombre ?? "—",
        },
        {
            id: "precio",
            header: "Precio",
            cell: ({ row }) => formatearPrecio(row.original.precio_base),
        },
        { id: "stock", header: "Stock", cell: ({ row }) => row.original.stock },
        {
            id: "disponible",
            header: "Estado",
            cell: ({ row }) => (
                <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.original.disponible
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                >
                    {row.original.disponible ? "Disponible" : "No disponible"}
                </span>
            ),
        },
        {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    <Button
                        variante="secundario"
                        onClick={() => setModal({ tipo: "formulario", producto: row.original })}
                    >
                        Editar
                    </Button>
                    <Button
                        variante="secundario"
                        onClick={() => setModal({ tipo: "stock", producto: row.original })}
                    >
                        Stock
                    </Button>
                    <Button
                        variante="peligro"
                        disabled={eliminar.isPending}
                        onClick={() => handleEliminar(row.original)}
                    >
                        Dar de baja
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Productos</h1>
                <Button onClick={() => setModal({ tipo: "formulario", producto: null })}>
                    Nuevo producto
                </Button>
            </div>

            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}

            {productos.isLoading && (
                <div className="space-y-2" role="status" aria-label="Cargando productos">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            )}

            {productos.isError && (
                <EstadoError
                    mensaje={handleApiError(productos.error, "No se pudieron cargar los productos")}
                    onReintentar={() => void productos.refetch()}
                />
            )}

            {productos.data && productos.data.items.length === 0 && (
                <EstadoVacio titulo="No hay productos" descripcion="Creá el primero con el botón «Nuevo producto»." />
            )}

            {productos.data && productos.data.items.length > 0 && (
                <>
                    <DataTable
                        data={productos.data.items}
                        columns={columnas}
                        getRowId={(producto) => String(producto.id)}
                    />
                    {productos.data.total > productos.data.items.length && (
                        <p className="text-xs text-slate-500">
                            Mostrando los primeros {productos.data.items.length} de {productos.data.total} productos.
                        </p>
                    )}
                </>
            )}

            {modal?.tipo === "formulario" && (
                <ProductoFormModal producto={modal.producto} onCerrar={() => setModal(null)} />
            )}
            {modal?.tipo === "stock" && (
                <StockModal producto={modal.producto} onCerrar={() => setModal(null)} />
            )}
        </div>
    );
}