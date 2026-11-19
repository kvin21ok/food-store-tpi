import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Input from "../../../shared/ui/Input";
import { primerError } from "../../../shared/utils/primerError";
import { useAuthStore } from "../../../store/authStore";

interface LocationState {
    registrado?: boolean;
    from?: string;
}

export default function LoginPage() {
    const login = useAuthStore((state) => state.login);
    const usuario = useAuthStore((state) => state.usuario);
    const cargando = useAuthStore((state) => state.cargando);
    const location = useLocation();
    const state = location.state as LocationState | null;
    const [errorApi, setErrorApi] = useState<string | null>(null);

    const form = useForm({
        defaultValues: { username: "", password: "" },
        onSubmit: async ({ value }) => {
            setErrorApi(null);
            try {
                await login({ username: value.username.trim(), password: value.password });
            } catch (error) {
                setErrorApi(handleApiError(error, "No se pudo iniciar sesión"));
            }
        },
    });

    if (!cargando && usuario) {
        return <Navigate to={state?.from ?? "/"} replace />;
    }

    return (
        <Card className="mx-auto max-w-md">
            <h1 className="mb-4 text-xl font-semibold">Iniciar sesión</h1>

            {state?.registrado && (
                <p className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                    Cuenta creada. Ya podés iniciar sesión.
                </p>
            )}
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
                    validators={{
                        onChange: ({ value }) => (value.trim() ? undefined : "Ingresá tu usuario"),
                    }}>
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
                    name="password"
                    validators={{
                        onChange: ({ value }) => (value ? undefined : "Ingresá tu contraseña"),
                    }}
                    >
                    {(field) => (
                        <Input
                            label="Contraseña"
                            type="password"
                            autoComplete="current-password"
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
                        {isSubmitting ? "Ingresando..." : "Ingresar"}
                        </Button>
                    )}
                </form.Subscribe>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                ¿No tenés cuenta?{" "}
                <Link to="/register" className="font-medium text-orange-600 hover:underline">
                    Registrate
                </Link>
            </p>
        </Card>
    );
}