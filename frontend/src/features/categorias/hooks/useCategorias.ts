import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    actualizarCategoria,
    crearCategoria,
    eliminarCategoria,
    listarCategorias,
} from "../api/categorias";
import type { CategoriaInput } from "../types/categoria";

export function useCategorias() {
    return useQuery({
        queryKey: ["categorias"],
        queryFn: listarCategorias,
    });
}

// el nombre de la categoría viaja anidado en los productos: se refrescan ambos
function useInvalidarCatalogo() {
    const queryClient = useQueryClient();
    return async () => {
        await queryClient.invalidateQueries({ queryKey: ["categorias"] });
        await queryClient.invalidateQueries({ queryKey: ["productos"] });
    };
}

export function useCrearCategoria() {
    const invalidar = useInvalidarCatalogo();
    return useMutation({
        mutationFn: (datos: CategoriaInput) => crearCategoria(datos),
        onSuccess: invalidar,
    });
}

export function useActualizarCategoria() {
    const invalidar = useInvalidarCatalogo();
    return useMutation({
        mutationFn: ({ id, datos }: { id: number; datos: CategoriaInput }) =>
            actualizarCategoria(id, datos),
            onSuccess: invalidar,
    });
}

export function useEliminarCategoria() {
    const invalidar = useInvalidarCatalogo();
    return useMutation({
        mutationFn: (id: number) => eliminarCategoria(id),
        onSuccess: invalidar,
    });
}