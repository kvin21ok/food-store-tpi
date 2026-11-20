import type { EstadoPedido } from "./pedido";

export const ESTADOS_PEDIDO: EstadoPedido[] = [
    "PENDIENTE",
    "EN_PREPARACION",
    "ENTREGADO",
    "CANCELADO",
];

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
    PENDIENTE: "Pendiente",
    EN_PREPARACION: "En preparación",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};

export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
    PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
    EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
    ENTREGADO: [],
    CANCELADO: [],
};

export const ACCION_ESTADO: Record<EstadoPedido, string> = {
    PENDIENTE: "Volver a pendiente",
    EN_PREPARACION: "Preparar",
    ENTREGADO: "Marcar entregado",
    CANCELADO: "Cancelar",
};