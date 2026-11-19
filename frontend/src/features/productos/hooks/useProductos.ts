import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listarProductos } from "../api/productos";
import type { FiltrosProductos } from "../types/producto";

export function useProductos(filtros: FiltrosProductos) {
    return useQuery({
        queryKey: ["productos", filtros],
        queryFn: () => listarProductos(filtros),
        // mantiene la pagina anterior en pantalla mientras carga la siguiente
        placeholderData: keepPreviousData,
    });
}