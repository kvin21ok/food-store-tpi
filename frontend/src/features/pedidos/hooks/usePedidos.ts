import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { cancelarPedido, crearPedido, listarPedidos } from "../api/pedidos";
import type { FiltrosPedidos } from "../types/pedido";

export function usePedidos(filtros: FiltrosPedidos) {
    return useQuery({
        queryKey: ["pedidos", filtros],
        queryFn: () => listarPedidos(filtros),
        placeholderData: keepPreviousData,
    });
}

// crear y cancelar mueven el stock: se invalidan pedidos y productos
export function useCrearPedido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: crearPedido,
        onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
        await queryClient.invalidateQueries({ queryKey: ["productos"] });
        },
    });
}

export function useCancelarPedido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: cancelarPedido,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
            await queryClient.invalidateQueries({ queryKey: ["productos"] });
        },
    });
}