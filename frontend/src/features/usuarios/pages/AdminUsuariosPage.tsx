import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Skeleton from "../../../shared/components/Skeleton";
import Button from "../../../shared/ui/Button";
import { useAuthStore } from "../../../store/authStore";
import type { UsuarioPublic } from "../../auth/types/auth";
import {
    useActivarUsuario,
    useDesactivarUsuario,
    useUsuarios,
} from "../hooks/useUsuarios";

export default function AdminUsuariosPage() {
    const sesion = useAuthStore((state) => state.usuario);
    const usuarios = useUsuarios();
    const activar = useActivarUsuario();
    const desactivar = useDesactivarUsuario();
    const [error, setError] = useState<string | null>(null);

    const ocupado = activar.isPending || desactivar.isPending;

    function handleActivar(usuario: UsuarioPublic) {
        setError(null);
        activar.mutate(usuario.id, {
            onError: (e) => setError(handleApiError(e, "No se pudo activar el usuario")),
        });
    }

    function handleDesactivar(usuario: UsuarioPublic) {
        if (!window.confirm(`¿Desactivar a "${usuario.username}"?`)) return;
        setError(null);
        desactivar.mutate(usuario.id, {
            onError: (e) => setError(handleApiError(e, "No se pudo desactivar el usuario")),
        });
    }

    const columnas: ColumnDef<UsuarioPublic>[] = [
        { id: "username", header: "Usuario", cell: ({ row }) => row.original.username },
        { id: "nombre", header: "Nombre", cell: ({ row }) => row.original.full_name },
        { id: "email", header: "Email", cell: ({ row }) => row.original.email },
        {
            id: "rol",
            header: "Rol",
            cell: ({ row }) => (row.original.role === "admin" ? "Administrador" : "Cliente"),
        },
        {
            id: "estado",
            header: "Estado",
            cell: ({ row }) => (
                <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.original.disabled
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                >
                    {row.original.disabled ? "Desactivado" : "Activo"}
                </span>
            ),
        },
        {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => {
                const usuario = row.original;
                if (usuario.disabled) {
                    return (
                        <Button disabled={ocupado} onClick={() => handleActivar(usuario)}>
                            Activar
                        </Button>
                    );
                }
                // el admin no puede desactivarse a sí mismo: no se muestra el botón
                if (usuario.id === sesion?.id) return null;
                return (
                    <Button
                        variante="peligro"
                        disabled={ocupado}
                        onClick={() => handleDesactivar(usuario)}
                    >
                        Desactivar
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Usuarios</h1>

            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}

            {usuarios.isLoading && (
                <div className="space-y-2" role="status" aria-label="Cargando usuarios">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            )}

            {usuarios.isError && (
                <EstadoError
                    mensaje={handleApiError(usuarios.error, "No se pudieron cargar los usuarios")}
                    onReintentar={() => void usuarios.refetch()}
                />
            )}

            {usuarios.data && usuarios.data.length === 0 && (
                <EstadoVacio titulo="No hay usuarios" />
            )}

            {usuarios.data && usuarios.data.length > 0 && (
                <DataTable
                    data={usuarios.data}
                    columns={columnas}
                    getRowId={(usuario) => String(usuario.id)}
                />
            )}
        </div>
    );
}