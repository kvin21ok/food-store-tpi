import Button from "../ui/Button";

interface PaginacionProps {
    pagina: number;
    total: number;
    porPagina: number;
    onCambiar: (pagina: number) => void;
    deshabilitado?: boolean;
}

export default function Paginacion({
    pagina,
    total,
    porPagina,
    onCambiar,
    deshabilitado = false,
}: PaginacionProps) {
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    if (totalPaginas <= 1) return null;

    return (
        <nav className="flex items-center justify-center gap-3" aria-label="Paginación">
            <Button 
                variante="secundario"
                disabled={pagina <= 1 || deshabilitado}
                onClick={() => onCambiar(pagina - 1)}
            >
                Anterior
            </Button>
            <span className="text-sm text-slate-600">
                Página {pagina} de {totalPaginas}
            </span>
            <Button
                variante="secundario"
                disabled={pagina >= totalPaginas || deshabilitado}
                onClick={() => onCambiar(pagina + 1)}
            >
                Siguiente
            </Button>
        </nav>
    );
}