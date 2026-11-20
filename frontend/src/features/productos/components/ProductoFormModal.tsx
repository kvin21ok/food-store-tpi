import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Modal from "../../../shared/ui/Modal";
import Select from "../../../shared/ui/Select";
import Textarea from "../../../shared/ui/Textarea";
import { primerError } from "../../../shared/utils/primerError";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { useActualizarProducto, useCrearProducto } from "../hooks/useProductos";
import type { Producto } from "../types/producto";

interface ProductoFormModalProps {
    producto: Producto | null;
    onCerrar: () => void;
}

function validarNumero(valor: string, entero: boolean): string | undefined {
    if (valor.trim() === "") return "Campo obligatorio";
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "Ingresá un número válido";
    if (numero < 0) return "No puede ser negativo";
    if (entero && !Number.isInteger(numero)) return "Tiene que ser un número entero";
    return undefined;
}

export default function ProductoFormModal({
    producto,
    onCerrar,
}: ProductoFormModalProps) {
    const categorias = useCategorias();
    const crear = useCrearProducto();
    const actualizar = useActualizarProducto();
    const [errorApi, setErrorApi] = useState<string | null>(null);
    const esEdicion = producto !== null;

    const opciones = categorias.data ?? [];
    // si la categoría actual fue dada de baja, no figura en la lista de activas
    const actualFueraDeLista =
        producto !== null && !opciones.some((c) => c.id === producto.categoria_id);

    const form = useForm({
        defaultValues: {
            nombre: producto?.nombre ?? "",
            descripcion: producto?.descripcion ?? "",
            categoria_id: producto ? String(producto.categoria_id) : "",
            precio_base: producto ? String(producto.precio_base) : "",
            imagen_url: producto?.imagen_url ?? "",
            stock: "0",
            disponible: true,
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            const categoriaId = Number(value.categoria_id);
            const base = {
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
                precio_base: Number(value.precio_base),
                imagen_url: value.imagen_url.trim() || null,
            };
            try {
                if (producto) {
                    // solo se envía la categoría si cambió: una baja previa daría 404
                    await actualizar.mutateAsync({
                        id: producto.id,
                        datos: {
                            ...base,
                            categoria_id:
                            categoriaId !== producto.categoria_id ? categoriaId : undefined,
                        },
                    });
                } else {
                    await crear.mutateAsync({
                        ...base,
                        categoria_id: categoriaId,
                        stock: Number(value.stock),
                        disponible: value.disponible,
                    });
                }
                onCerrar();
            } catch (error) {
                setErrorApi(handleApiError(error, "No se pudo guardar el producto"));
            }
        },
    });

    return (
        <Modal
            titulo={esEdicion ? "Editar producto" : "Nuevo producto"}
            onCerrar={onCerrar}
        >
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
                    name="nombre"
                    validators={{
                        onChange: ({ value }) => (value.trim() ? undefined : "Campo obligatorio"),
                    }}
                >
                    {(field) => (
                        <Input
                            label="Nombre"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                        />
                    )}
                </form.Field>

                <form.Field name="descripcion">
                    {(field) => (
                        <Textarea
                            label="Descripción (opcional)"
                            rows={2}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    )}
                </form.Field>

                <form.Field
                    name="categoria_id"
                    validators={{
                        onChange: ({ value }) => (value ? undefined : "Elegí una categoría"),
                    }}
                >
                    {(field) => (
                        <Select
                            label="Categoría"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                        >
                            <option value="">Elegí una categoría</option>
                            {actualFueraDeLista && producto && (
                                <option value={producto.categoria_id}>
                                    {producto.categoria?.nombre ?? `Categoría ${producto.categoria_id}`} (dada de baja)
                                </option>
                            )}
                            {opciones.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </Select>
                    )}
                </form.Field>

                <form.Field
                    name="precio_base"
                    validators={{ onChange: ({ value }) => validarNumero(value, false) }}
                >
                    {(field) => (
                        <Input
                            label="Precio"
                            type="number"
                            min="0"
                            step="0.01"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                        />
                    )}
                </form.Field>

                <form.Field name="imagen_url">
                    {(field) => (
                        <Input
                            label="URL de la imagen (opcional)"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    )}
                </form.Field>

                {!esEdicion && (
                    <>
                        <form.Field
                            name="stock"
                            validators={{ onChange: ({ value }) => validarNumero(value, true) }}
                        >
                            {(field) => (
                                <Input
                                    label="Stock inicial"
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
                    </>
                )}

                {esEdicion && (
                    <p className="text-xs text-slate-500">
                        El stock y la disponibilidad se modifican con el botón «Stock» de la tabla.
                    </p>
                )}

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