import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Skeleton from "../../../shared/components/Skeleton";
import BadgeEstado from "../../../shared/ui/BadgeEstado";
import Button from "../../../shared/ui/Button";
import Select from "../../../shared/ui/Select";
import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import DetallePedidoModal from "../components/DetallePedidoModal";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido";
import type { EstadoPedido, Pedido } from "../types/pedido";
import {
    ACCION_ESTADO,
    ESTADOS_PEDIDO,
    ETIQUETA_ESTADO,
    TRANSICIONES,
} from "../types/transiciones";

export default function AdminPedidosPage() {
    const [estado, setEstado] = useState<EstadoPedido | "">("");
    const [detalle, setDetalle] = useState<Pedido | null>(null);
    const [error, setError] = useState<string | null>(null);

    // el panel pide limit=100 y pagina del lado del cliente
    const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined });
    const cambiar = useCambiarEstadoPedido();

    function handleCambiar(pedido: Pedido, destino: EstadoPedido) {
        if (
            destino === "CANCELADO" &&
            !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se restituye el stock.`)
        ) {
            return;
        }
        setError(null);
        cambiar.mutate(
            { id: pedido.id, estado: destino },
            {
                onError: (e) => setError(handleApiError(e, "No se pudo cambiar el estado")),
            },
        );
    }

    const columnas: ColumnDef<Pedido>[] = [
        { id: "id", header: "#", cell: ({ row }) => row.original.id },
        {
            id: "fecha",
            header: "Fecha",
            cell: ({ row }) => formatearFecha(row.original.created_at),
        },
        {
            id: "cliente",
            header: "Cliente",
            cell: ({ row }) => `Usuario #${row.original.usuario_id}`,
        },
        {
            id: "estado",
            header: "Estado",
            cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
        },
        {
            id: "pago",
            header: "Pago",
            cell: ({ row }) => ETIQUETA_FORMA_PAGO[row.original.forma_pago],
        },
        {
            id: "total",
            header: "Total",
            cell: ({ row }) => formatearPrecio(row.original.total),
        },
        {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    <Button variante="secundario" onClick={() => setDetalle(row.original)}>
                        Ver detalle
                    </Button>
                    {TRANSICIONES[row.original.estado].map((destino) => (
                        <Button
                            key={destino}
                            variante={destino === "CANCELADO" ? "peligro" : "primario"}
                            disabled={cambiar.isPending}
                            onClick={() => handleCambiar(row.original, destino)}
                        >
                            {ACCION_ESTADO[destino]}
                        </Button>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <h1 className="text-2xl font-bold">Pedidos</h1>
                <div className="w-56">
                    <Select
                        label="Filtrar por estado"
                        value={estado}
                        onChange={(e) =>
                            setEstado(ESTADOS_PEDIDO.find((x) => x === e.target.value) ?? "")
                        }
                    >
                        <option value="">Todos</option>
                        {ESTADOS_PEDIDO.map((valor) => (
                            <option key={valor} value={valor}>
                                {ETIQUETA_ESTADO[valor]}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}

            {pedidos.isLoading && (
                <div className="space-y-2" role="status" aria-label="Cargando pedidos">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            )}

            {pedidos.isError && (
                <EstadoError
                    mensaje={handleApiError(pedidos.error, "No se pudieron cargar los pedidos")}
                    onReintentar={() => void pedidos.refetch()}
                />
            )}

            {pedidos.data && pedidos.data.items.length === 0 && (
                <EstadoVacio
                    titulo="No hay pedidos"
                    descripcion={estado ? "No hay pedidos en ese estado." : "Todavía no se creó ningún pedido."}
                />
            )}

            {pedidos.data && pedidos.data.items.length > 0 && (
                <>
                    <DataTable
                        data={pedidos.data.items}
                        columns={columnas}
                        getRowId={(pedido) => String(pedido.id)}
                    />
                    {pedidos.data.total > pedidos.data.items.length && (
                        <p className="text-xs text-slate-500">
                            Mostrando los primeros {pedidos.data.items.length} de {pedidos.data.total} pedidos.
                        </p>
                    )}
                </>
            )}

            {detalle && (
                <DetallePedidoModal pedido={detalle} onCerrar={() => setDetalle(null)} />
            )}
        </div>
    );
}