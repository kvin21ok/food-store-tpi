import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Input from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/primerError";
import { useAuthStore } from "../../../store/authStore";
import { useRegistro } from "../hooks/useRegistro";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarLargo(valor: string, min: number, max: number): string | undefined {
    const largo = valor.trim().length;
    if (largo < min) return min === 1 ? "Campo obligatorio" : `Mínimo ${min} caracteres`;
    if (largo > max) return `Máximo ${max} caracteres`;
    return undefined;
}

export default function RegisterPage() {
    const usuario = useAuthStore((state) => state.usuario);
    const cargando = useAuthStore((state) => state.cargando);
    const navigate = useNavigate();
    const registro = useRegistro();
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: {
        username: "",
        full_name: "",
        email: "",
        password: "",
        confirmar: "",
    },
    onSubmit: async ({ value }) => {
        setErrorApi(null);
        try {
            await registro.mutateAsync({
                username: value.username.trim(),
                full_name: value.full_name.trim(),
                email: value.email.trim(),
                password: value.password,
            });
            navigate("/login", { state: { registrado: true } });
        } catch (error) {
            setErrorApi(handleApiError(error, "No se pudo completar el registro"));
        }
    },
    });

    if (!cargando && usuario) {
        return <Navigate to="/" replace />;
    }

    return (
        <Card className="mx-auto max-w-md">
            <h1 className="mb-4 text-xl font-semibold">Crear cuenta</h1>

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
                    name="username"
                    validators={{ onChange: ({ value }) => validarLargo(value, 3, 50) }}
                    >
                    {(field) => (
                        <Input
                            label="Usuario"
                            autoComplete="username"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                        />
                        )}
                    </form.Field>

                    <form.Field 
                        name="full_name"
                        validators={{ onChange: ({ value }) => validarLargo(value, 1, 100) }}
                        >
                        {(field) => (
                            <Input
                                label="Nombre completo"
                                autoComplete="name"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="email"
                        validators={{
                            onChange: ({ value }) =>
                            EMAIL_REGEX.test(value.trim()) ? undefined : "Ingresá un email válido",
                        }}
                        >
                        {(field) => (
                            <Input
                                label="Email"
                                type="email"
                                autoComplete="email"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="password"
                        validators={{
                            onChange: ({ value }) =>
                                value.length < 8
                                ? "Mínimo 8 caracteres"
                                : value.length > 72
                                ? "Máximo 72 caracteres"
                                : undefined,
                        }}
                        >
                        {(field) => (
                            <Input
                                label="Contraseña"
                                type="password"
                                autoComplete="new-password"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                            />
                        )}
                    </form.Field>

                    <form.Field
                        name="confirmar"
                        validators={{
                            onChangeListenTo: ["password"],
                            onChange: ({ value, fieldApi }) =>
                                value !== fieldApi.form.getFieldValue("password")
                                ? "Las contraseñas no coinciden"
                                : undefined,
                        }}
                        >
                        {(field) => (
                            <Input
                                label="Repetir contraseña"
                                type="password"
                                autoComplete="new-password"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={field.state.meta.isTouched ? primerError(field.state.meta.errors) : undefined}
                            />
                        )}
                    </form.Field>

                    <form.Subscribe selector={(s) => s.isSubmitting}>
                    {(isSubmitting) => (
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Creando cuenta..." : "Registrarme"}
                        </Button>
                    )}
                    </form.Subscribe>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                ¿Ya tenés cuenta?{" "}
                <Link to="/login" className="font-medium text-orange-600 hover:underline">
                    Iniciá sesión
                </Link>
            </p>
        </Card>
    );
}