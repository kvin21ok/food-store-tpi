import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Paginacion from "../../../shared/components/Paginacion";
import Skeleton from "../../../shared/components/Skeleton";
import BadgeEstado from "../../../shared/ui/BadgeEstado";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { CLASE_LINK_BOTON } from "../../../shared/ui/estilos";
import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import DetallePedidoModal from "../components/DetallePedidoModal";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido";
import type { Pedido } from "../types/pedido";

const POR_PAGINA = 10;

export default function MisPedidosPage() {
    const [pagina, setPagina] = useState(1);
    const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);
    const [errorCancelar, setErrorCancelar] = useState<string | null>(null);

    const location = useLocation();
    const recienCreado = (location.state as { creado?: boolean } | null)?.creado === true;

    const pedidos = usePedidos({
        skip: (pagina - 1) * POR_PAGINA,
        limit: POR_PAGINA,
    });
    const cancelar = useCancelarPedido();

    function handleCancelar(pedido: Pedido) {
        if (!window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) return;
        setErrorCancelar(null);
        cancelar.mutate(pedido.id, {
            onSuccess: () => setSeleccionado(null),
            onError: (error) =>
                setErrorCancelar(handleApiError(error, "No se pudo cancelar el pedido")),
        });
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Mis pedidos</h1>

            {recienCreado && (
                <p className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">
                    ¡Pedido confirmado! Te avisaremos cuando avance.
                </p>
            )}
            {errorCancelar && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {errorCancelar}
                </p>
            )}

            {pedidos.isLoading && (
                <div className="space-y-3" role="status" aria-label="Cargando pedidos">
                    {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            )}

            {pedidos.isError && (
                <EstadoError
                    mensaje={handleApiError(pedidos.error, "No se pudieron cargar tus pedidos")}
                    onReintentar={() => void pedidos.refetch()}
                />
            )}

            {pedidos.data && pedidos.data.items.length === 0 && (
                <EstadoVacio titulo="Todavía no hiciste pedidos" descripcion="Cuando confirmes uno, lo vas a ver acá.">
                    <Link to="/" className={CLASE_LINK_BOTON}>
                        Ir al catálogo
                    </Link>
                </EstadoVacio>
            )}

            {pedidos.data && pedidos.data.items.length > 0 && (
                <>
                    <div className="space-y-3">
                        {pedidos.data.items.map((pedido) => (
                            <Card key={pedido.id} className="flex flex-wrap items-center gap-4 p-4">
                                <div>
                                    <p className="font-semibold">Pedido #{pedido.id}</p>
                                    <p className="text-xs text-slate-500">{formatearFecha(pedido.created_at)}</p>
                                </div>
                                <BadgeEstado estado={pedido.estado} />
                                <span className="text-sm text-slate-600">
                                    {ETIQUETA_FORMA_PAGO[pedido.forma_pago]}
                                </span>
                                <span className="ml-auto font-semibold">{formatearPrecio(pedido.total)}</span>
                                <Button variante="secundario" onClick={() => setSeleccionado(pedido)}>
                                    Ver detalle
                                </Button>
                                {pedido.estado === "PENDIENTE" && (
                                    <Button
                                        variante="peligro"
                                        disabled={cancelar.isPending}
                                        onClick={() => handleCancelar(pedido)}
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>

                    <Paginacion
                        pagina={pagina}
                        total={pedidos.data.total}
                        porPagina={POR_PAGINA}
                        onCambiar={setPagina}
                        deshabilitado={pedidos.isPlaceholderData}
                    />
                </>
            )}

            {seleccionado && (
                <DetallePedidoModal
                    pedido={seleccionado}
                    onCerrar={() => setSeleccionado(null)}
                    onCancelar={() => handleCancelar(seleccionado)}
                    cancelando={cancelar.isPending}
                />
            )}
        </div>
    );
}