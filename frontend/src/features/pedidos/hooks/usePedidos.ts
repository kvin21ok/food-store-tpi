import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    cambiarEstadoPedido,
    cancelarPedido,
    crearPedido,
    listarPedidos,
    obtenerResumen,
} from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos } from "../types/pedido";

export function usePedidos(filtros: FiltrosPedidos) {
    return useQuery({
        queryKey: ["pedidos", filtros],
        queryFn: () => listarPedidos(filtros),
        placeholderData: keepPreviousData,
    });
}

export function useResumenPedidos() {
    return useQuery({
        queryKey: ["pedidos", "resumen"],
        queryFn: obtenerResumen,
    });
}

function useInvalidarPedidos() {
    const queryClient = useQueryClient();
    return async () => {
        await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
        await queryClient.invalidateQueries({ queryKey: ["productos"] });
    };
}

export function useCrearPedido() {
    const invalidar = useInvalidarPedidos();
    return useMutation({
        mutationFn: crearPedido,
        onSuccess: invalidar,
    });
}

export function useCancelarPedido() {
    const invalidar = useInvalidarPedidos();
    return useMutation({
        mutationFn: cancelarPedido,
        onSuccess: invalidar,
    });
}

export function useCambiarEstadoPedido() {
    const invalidar = useInvalidarPedidos();
    return useMutation({
        mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
            cambiarEstadoPedido(id, estado),
            onSuccess: invalidar,
    });
}