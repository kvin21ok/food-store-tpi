import BadgeEstado from "../../../shared/ui/BadgeEstado";
import Button from "../../../shared/ui/Button";
import Modal from "../../../shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido";
import type { Pedido } from "../types/pedido";

interface DetallePedidoModalProps {
    pedido: Pedido;
    onCerrar: () => void;
    onCancelar?: () => void;
    cancelando?: boolean;
}

export default function DetallePedidoModal({
    pedido,
    onCerrar,
    onCancelar,
    cancelando = false,
}: DetallePedidoModalProps) {
    return (
        <Modal titulo={`Pedido #${pedido.id}`} onCerrar={onCerrar}>
            <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                    <BadgeEstado estado={pedido.estado} />
                    <span className="text-slate-500">{formatearFecha(pedido.created_at)}</span>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                            <th className="py-2">Producto</th>
                            <th className="py-2 text-right">Cant.</th>
                            <th className="py-2 text-right">Precio</th>
                            <th className="py-2 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedido.items.map((item) => (
                            <tr key={item.producto_id} className="border-b border-slate-100">
                                <td className="py-2">{item.nombre_producto}</td>
                                <td className="py-2 text-right">{item.cantidad}</td>
                                <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
                                <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="pt-3 text-right font-semibold">
                                Total
                            </td>
                            <td className="pt-3 text-right font-semibold">{formatearPrecio(pedido.total)}</td>
                        </tr>
                    </tfoot>
                </table>

                <dl className="space-y-1">
                    <div className="flex gap-2">
                        <dt className="font-medium">Forma de pago:</dt>
                        <dd>{ETIQUETA_FORMA_PAGO[pedido.forma_pago]}</dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="font-medium">Dirección:</dt>
                        <dd>{pedido.direccion_entrega}</dd>
                    </div>
                    {pedido.notas && (
                        <div className="flex gap-2">
                            <dt className="font-medium">Notas:</dt>
                            <dd>{pedido.notas}</dd>
                        </div>
                    )}
                </dl>

                <div className="flex justify-end gap-2">
                    {onCancelar && pedido.estado === "PENDIENTE" && (
                        <Button variante="peligro" disabled={cancelando} onClick={onCancelar}>
                            {cancelando ? "Cancelando..." : "Cancelar pedido"}
                        </Button>
                    )}
                    <Button variante="secundario" onClick={onCerrar}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </Modal>
    );
}