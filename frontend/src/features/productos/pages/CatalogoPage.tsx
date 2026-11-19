import { useState } from "react";
import type { FormEvent } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Paginacion from "../../../shared/components/Paginacion";
import Skeleton from "../../../shared/components/Skeleton";
import Button from "../../../shared/ui/Button";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 6;

export default function CatalogoPage() {
    const [pagina, setPagina] = useState(1);
    const [texto, setTexto] = useState("");
    const [search, setSearch] = useState("");
    const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

    const categorias = useCategorias();
    const productos = useProductos({
        skip: (pagina - 1) * POR_PAGINA,
        limit: POR_PAGINA,
        search: search || undefined,
        categoria_id: categoriaId,
    });

    const hayFiltros = search !== "" || categoriaId !== undefined;

    function handleBuscar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPagina(1);
        setSearch(texto.trim());
    }

    function handleCategoria(valor: string) {
        setPagina(1);
        setCategoriaId(valor === "" ? undefined : Number(valor));
    }

    function limpiarFiltros() {
        setPagina(1);
        setTexto("");
        setSearch("");
        setCategoriaId(undefined);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Catálogo</h1>

            <div className="flex flex-wrap items-center gap-3">
                <form onSubmit={handleBuscar} className="flex flex-1 gap-2">
                    <input
                        type="search"
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="Buscar por nombre..."
                        aria-label="Buscar por nombre"
                        className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Button type="submit">Buscar</Button>
                </form>

                <select
                    value={categoriaId ?? ""}
                    onChange={(e) => handleCategoria(e.target.value)}
                    aria-label="Filtrar por categoría"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value="">Todas las categorías</option>
                    {categorias.data?.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                        </option>
                    ))}
                </select>

                {hayFiltros && (
                    <Button variante="secundario" onClick={limpiarFiltros}>
                        Limpiar filtros
                    </Button>
                )}
            </div>

            {productos.isLoading && (
                <div
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    role="status"
                    aria-label="Cargando productos"
                >
                    {Array.from({ length: POR_PAGINA }, (_, i) => (
                        <div key={i} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    ))}
                </div>
            )}

            {productos.isError && (
                <EstadoError
                    mensaje={handleApiError(productos.error, "No se pudo cargar el catálogo")}
                    onReintentar={() => void productos.refetch()}
                />
            )}

            {productos.data && productos.data.items.length === 0 && (
                <EstadoVacio
                    titulo="No encontramos productos"
                    descripcion={
                        hayFiltros
                        ? "Probá con otra búsqueda o quitá los filtros."
                        : "Todavía no hay productos cargados."
                    }
                >
                    {hayFiltros && (
                        <Button variante="secundario" onClick={limpiarFiltros}>
                            Limpiar filtros
                        </Button>
                    )}
                </EstadoVacio>
            )}

            {productos.data && productos.data.items.length > 0 && (
                <>
                    <div
                        className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                            productos.isPlaceholderData ? "opacity-60" : ""
                        }`}
                    >
                        {productos.data.items.map((producto) => (
                            <ProductoCard key={producto.id} producto={producto} />
                        ))}
                    </div>

                    <Paginacion
                        pagina={pagina}
                        total={productos.data.total}
                        porPagina={POR_PAGINA}
                        onCambiar={setPagina}
                        deshabilitado={productos.isPlaceholderData}
                    />
                </>
            )}
        </div>
    );
}