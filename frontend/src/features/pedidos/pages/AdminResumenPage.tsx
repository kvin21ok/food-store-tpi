import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import Skeleton from "../../../shared/components/Skeleton";
import { formatearPrecio } from "../../../shared/utils/formato";
import TarjetaResumen from "../components/TarjetaResumen";
import { useResumenPedidos } from "../hooks/usePedidos";

export default function AdminResumenPage() {
    const resumen = useResumenPedidos();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Resumen</h1>

            {resumen.isLoading && (
                <div
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    role="status"
                    aria-label="Cargando resumen"
                >
                    {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            )}

            {resumen.isError && (
                <EstadoError
                    mensaje={handleApiError(resumen.error, "No se pudo cargar el resumen")}
                    onReintentar={() => void resumen.refetch()}
                />
            )}

            {resumen.data && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <TarjetaResumen
                        titulo="Pendientes"
                        valor={String(resumen.data.pendientes)}
                        acento="text-amber-600"
                    />
                    <TarjetaResumen
                        titulo="En preparación"
                        valor={String(resumen.data.en_preparacion)}
                        acento="text-blue-600"
                    />
                    <TarjetaResumen
                        titulo="Entregados"
                        valor={String(resumen.data.entregados)}
                        acento="text-green-600"
                    />
                    <TarjetaResumen
                        titulo="Cancelados"
                        valor={String(resumen.data.cancelados)}
                        acento="text-red-600"
                    />
                    <TarjetaResumen titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} />
                    <TarjetaResumen
                        titulo="Ingresos (entregados)"
                        valor={formatearPrecio(resumen.data.ingresos_entregados)}
                    />
                </div>
            )}
        </div>
    );
}