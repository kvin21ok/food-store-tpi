import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Modal from "../../../shared/ui/Modal";
import { primerError } from "../../../shared/utils/primerError";
import { useActualizarStock } from "../hooks/useProductos";
import type { Producto } from "../types/producto";

interface StockModalProps {
    producto: Producto;
    onCerrar: () => void;
}

function validarStock(valor: string): string | undefined {
    if (valor.trim() === "") return "Campo obligatorio";
    const numero = Number(valor);
    if (!Number.isInteger(numero)) return "Tiene que ser un número entero";
    if (numero < 0) return "No puede ser negativo";
    return undefined;
}

export default function StockModal({ producto, onCerrar }: StockModalProps) {
    const actualizar = useActualizarStock();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            stock: String(producto.stock),
            disponible: producto.disponible,
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            try {
                await actualizar.mutateAsync({
                    id: producto.id,
                    datos: { stock: Number(value.stock), disponible: value.disponible },
                });
                onCerrar();
            } catch (error) {
                setErrorApi(handleApiError(error, "No se pudo actualizar el stock"));
            }
        },
    });

    return (
        <Modal titulo={`Stock de ${producto.nombre}`} onCerrar={onCerrar}>
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
                    name="stock"
                    validators={{ onChange: ({ value }) => validarStock(value) }}
                >
                    {(field) => (
                        <Input
                            label="Stock"
                            type="number"
                            min="0"
                            step="1"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                        />
                    )}
                </form.Field>

                <form.Field name="disponible">
                    {(field) => (
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={field.state.value}
                                onChange={(e) => field.handleChange(e.target.checked)}
                            />
                                Disponible para la venta
                        </label>
                    )}
                </form.Field>

                <div className="flex justify-end gap-2">
                    <Button variante="secundario" onClick={onCerrar}>
                        Cancelar
                    </Button>
                    <form.Subscribe selector={(s) => s.isSubmitting}>
                        {(isSubmitting) => (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </Button>
                        )}
                    </form.Subscribe>
                </div>
            </form>
        </Modal>
    );
}