import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Modal from "../../../shared/ui/Modal";
import Textarea from "../../../shared/ui/Textarea";
import { primerError } from "../../../shared/utils/primerError";
import {
    useActualizarCategoria,
    useCrearCategoria,
} from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria";

interface CategoriaFormModalProps {
    categoria: Categoria | null;
    onCerrar: () => void;
}

function validarNombre(valor: string): string | undefined {
    const largo = valor.trim().length;
    if (largo < 2) return "Mínimo 2 caracteres";
    if (largo > 100) return "Máximo 100 caracteres";
    return undefined;
}

export default function CategoriaFormModal({
    categoria,
    onCerrar,
}: CategoriaFormModalProps) {
    const crear = useCrearCategoria();
    const actualizar = useActualizarCategoria();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
            nombre: categoria?.nombre ?? "",
            descripcion: categoria?.descripcion ?? "",
        },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            const datos = {
                nombre: value.nombre.trim(),
                descripcion: value.descripcion.trim() || null,
            };
            try {
                if (categoria) {
                    await actualizar.mutateAsync({ id: categoria.id, datos });
                } else {
                    await crear.mutateAsync(datos);
                }
                onCerrar();
            } catch (error) {
                setErrorApi(handleApiError(error, "No se pudo guardar la categoría"));
            }
        },
    });

    return (
        <Modal
            titulo={categoria ? "Editar categoría" : "Nueva categoría"}
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
                    validators={{ onChange: ({ value }) => validarNombre(value) }}
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
                            rows={3}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
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