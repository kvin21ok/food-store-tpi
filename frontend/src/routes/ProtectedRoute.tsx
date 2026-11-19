import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "../features/auth/types/auth";
import Skeleton from "../shared/components/Skeleton";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
    roles?: Rol[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
    const usuario = useAuthStore((state) => state.usuario);
    const cargando = useAuthStore((state) => state.cargando);
    const location = useLocation();

    if (cargando) {
        return (
            <div className="space-y-3" role="status" aria-label="Verificando la sesión">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!usuario) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (roles && !roles.includes(usuario.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />
}