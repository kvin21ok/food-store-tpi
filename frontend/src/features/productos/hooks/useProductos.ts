import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    actualizarProducto,
    actualizarStock,
    crearProducto,
    eliminarProducto,
    listarProductos,
} from "../api/productos";
import type {
    FiltrosProductos,
    ProductoEdicion,
    ProductoInput,
    StockInput,
} from "../types/producto";

export function useProductos(filtros: FiltrosProductos) {
    return useQuery({
        queryKey: ["productos", filtros],
        queryFn: () => listarProductos(filtros),
        // mantiene la página anterior en pantalla mientras carga la siguiente
        placeholderData: keepPreviousData,
    });
}

function useInvalidarProductos() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
    const invalidar = useInvalidarProductos();
    return useMutation({
        mutationFn: (datos: ProductoInput) => crearProducto(datos),
        onSuccess: invalidar,
    });
}

export function useActualizarProducto() {
    const invalidar = useInvalidarProductos();
    return useMutation({
        mutationFn: ({ id, datos }: { id: number; datos: ProductoEdicion }) =>
            actualizarProducto(id, datos),
            onSuccess: invalidar,
    });
}

export function useActualizarStock() {
    const invalidar = useInvalidarProductos();
    return useMutation({
        mutationFn: ({ id, datos }: { id: number; datos: StockInput }) =>
            actualizarStock(id, datos),
            onSuccess: invalidar,
    });
}

export function useEliminarProducto() {
    const invalidar = useInvalidarProductos();
    return useMutation({
        mutationFn: (id: number) => eliminarProducto(id),
        onSuccess: invalidar,
    });
}