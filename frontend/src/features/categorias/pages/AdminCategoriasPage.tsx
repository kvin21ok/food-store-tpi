import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Skeleton from "../../../shared/components/Skeleton";
import Button from "../../../shared/ui/Button";
import CategoriaFormModal from "../components/CategoriaFormModal";
import { useCategorias, useEliminarCategoria } from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria";

export default function AdminCategoriasPage() {
    const categorias = useCategorias();
    const eliminar = useEliminarCategoria();
    const [modal, setModal] = useState<Categoria | "nueva" | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleEliminar(categoria: Categoria) {
        if (!window.confirm(`¿Dar de baja la categoría "${categoria.nombre}"?`)) return;
        setError(null);
        eliminar.mutate(categoria.id, {
            onError: (e) => setError(handleApiError(e, "No se pudo dar de baja la categoría")),
        });
    }

    const columnas: ColumnDef<Categoria>[] = [
        { id: "id", header: "ID", cell: ({ row }) => row.original.id },
        { id: "nombre", header: "Nombre", cell: ({ row }) => row.original.nombre },
        {
            id: "descripcion",
            header: "Descripción",
            cell: ({ row }) => row.original.descripcion ?? "—",
        },
        {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variante="secundario" onClick={() => setModal(row.original)}>
                        Editar
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
                <h1 className="text-2xl font-bold">Categorías</h1>
                <Button onClick={() => setModal("nueva")}>Nueva categoría</Button>
            </div>

            <p className="text-sm text-slate-500">
                Dar de baja una categoría no oculta sus productos ni libera su nombre. Para
                retirarla del catálogo, dá de baja también sus productos.
            </p>

            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}

            {categorias.isLoading && (
                <div className="space-y-2" role="status" aria-label="Cargando categorías">
                    {Array.from({ length: 4 }, (_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            )}

            {categorias.isError && (
                <EstadoError
                    mensaje={handleApiError(categorias.error, "No se pudieron cargar las categorías")}
                    onReintentar={() => void categorias.refetch()}
                />
            )}

            {categorias.data && categorias.data.length === 0 && (
                <EstadoVacio titulo="No hay categorías" descripcion="Creá la primera con el botón «Nueva categoría»." />
            )}

            {categorias.data && categorias.data.length > 0 && (
                <DataTable
                    data={categorias.data}
                    columns={columnas}
                    getRowId={(categoria) => String(categoria.id)}
                />
            )}

            {modal !== null && (
                <CategoriaFormModal
                    categoria={modal === "nueva" ? null : modal}
                    onCerrar={() => setModal(null)}
                />
            )}
        </div>
    );
}