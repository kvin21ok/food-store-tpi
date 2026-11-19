import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { CLASE_LINK_BOTON } from "../../../shared/ui/estilos";
import Input from "../../../shared/ui/Input";
import { formatearPrecio } from "../../../shared/utils/formato";
import { primerError } from "../../../shared/utils/primerError";
import { useCartStore } from "../../../store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido";
import type { FormaPago } from "../types/pedido";

const FORMAS_PAGO: FormaPago[] = ["EFECTIVO", "TRANSFERENCIA"];

function validarDireccion(valor: string): string | undefined {
    const largo = valor.trim().length;
    if (largo < 5) return "Mínimo 5 caracteres";
    if (largo > 200) return "Máximo 200 caracteres";
    return undefined;
}

export default function CheckoutPage() {
    const items = useCartStore((state) => state.items);
    const total = useCartStore((state) => state.total);
    const vaciar = useCartStore((state) => state.vaciar);
    const crearPedido = useCrearPedido();
    const navigate = useNavigate();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            direccion_entrega: "",
            forma_pago: "EFECTIVO" as FormaPago,
            notas: "",
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            try {
                await crearPedido.mutateAsync({
                    items: items.map((item) => ({
                        producto_id: item.producto_id,
                        cantidad: item.cantidad,
                    })),
                    forma_pago: value.forma_pago,
                    direccion_entrega: value.direccion_entrega.trim(),
                    notas: value.notas.trim() || undefined,
                });
                vaciar();
                navigate("/mis-pedidos", { state: { creado: true } });
                } catch (error) {
                    setErrorApi(handleApiError(error, "No se pudo crear el pedido"));
                }
        },
    });

    if (items.length === 0) {
        return (
            <EstadoVacio titulo="Tu carrito está vacío" descripcion="Agregá productos para poder confirmar un pedido.">
                <Link to="/" className={CLASE_LINK_BOTON}>
                    Ir al catálogo
                </Link>
            </EstadoVacio>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Confirmar pedido</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <h2 className="mb-3 font-semibold">Resumen</h2>
                    <ul className="divide-y divide-slate-100 text-sm">
                        {items.map((item) => (
                            <li key={item.producto_id} className="flex justify-between py-2">
                                <span>
                                    {item.cantidad} × {item.nombre}
                                </span>
                                <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatearPrecio(total())}</span>
                    </p>
                </Card>

                <Card>
                    <h2 className="mb-3 font-semibold">Datos de entrega y pago</h2>

                    {errorApi && (
                        <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                            {errorApi}
                        </p>
                    )}

                    <form
                        className="space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void form.handleSubmit();
                        }}
                    >
                        <form.Field
                            name="direccion_entrega"
                            validators={{ onChange: ({ value }) => validarDireccion(value) }}
                        >
                            {(field) => (
                                <Input
                                    label="Dirección de entrega"
                                    autoComplete="street-address"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                                />
                            )}
                        </form.Field>

                        <form.Field name="forma_pago">
                            {(field) => (
                                <fieldset>
                                    <legend className="mb-1 text-sm font-medium text-slate-700">
                                        Forma de pago
                                    </legend>
                                    <div className="flex gap-4">
                                        {FORMAS_PAGO.map((forma) => (
                                        <label key={forma} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name="forma_pago"
                                                value={forma}
                                                checked={field.state.value === forma}
                                                onChange={() => field.handleChange(forma)}
                                            />
                                                {ETIQUETA_FORMA_PAGO[forma]}
                                        </label>
                                        ))}
                                    </div>
                                </fieldset>
                            )}
                        </form.Field>

                        <form.Field name="notas">
                            {(field) => (
                                <div className="space-y-1">
                                    <label htmlFor="notas" className="block text-sm font-medium text-slate-700">
                                        Notas (opcional)
                                    </label>
                                    <textarea
                                        id="notas"
                                        rows={3}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            )}
                        </form.Field>

                        <form.Subscribe selector={(s) => s.isSubmitting}>
                            {(isSubmitting) => (
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
                                </Button>
                            )}
                        </form.Subscribe>
                    </form>
                </Card>
            </div>
        </div>
    );
}