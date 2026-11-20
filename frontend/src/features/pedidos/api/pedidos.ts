import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
    EstadoPedido,
    FiltrosPedidos,
    Pedido,
    PedidoCreate,
    PedidosPaginados,
} from "../types/pedido";
import type { ResumenPedidos } from "../types/resumen";

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
    const { data } = await axiosInstance.post<Pedido>("/pedidos", datos);
    return data;
}

export async function listarPedidos(
    filtros: FiltrosPedidos,
): Promise<PedidosPaginados> {
    const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", {
        params: filtros,
    });
    return data;
}

export async function cancelarPedido(pedidoId: number): Promise<Pedido> {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${pedidoId}/cancelar`);
    return data;
}

export async function cambiarEstadoPedido(
    pedidoId: number,
    estado: EstadoPedido,
): Promise<Pedido> {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${pedidoId}/estado`, {
        estado,
    });
    return data;
}

export async function obtenerResumen(): Promise<ResumenPedidos> {
    const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
    return data;
}