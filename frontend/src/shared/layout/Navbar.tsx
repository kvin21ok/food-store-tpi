import { Link, NavLink, useNavigate } from "react-router-dom";
import type { Rol } from "../../features/auth/types/auth";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { queryClient } from "../api/queryClient";
import Button from "../ui/Button";

const ETIQUETA_ROL: Record<Rol, string> = {
    user: "Cliente",
    admin: "Administrador",
};

function claseLink({ isActive }: { isActive: boolean }): string {
    return `text-sm font-medium ${
        isActive ? "text-orange-600" : "text-slate-600 hover:text-slate-900"
    }`;
}

export default function Navbar() {
    const usuario = useAuthStore((state) => state.usuario);
    const logout = useAuthStore((state) => state.logout);
    const cantidad = useCartStore((state) =>
        state.items.reduce((total, item) => total + item.cantidad, 0),
    );
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        queryClient.clear();
        navigate("/login");
    }

    return (
        <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
                <Link to="/" className="text-lg font-bold text-orange-600">
                    Food Store
                </Link>

                <NavLink to="/" end className={claseLink}>
                    Catálogo
                </NavLink>
                <NavLink to="/carrito" className={claseLink}>
                    Carrito ({cantidad})
                </NavLink>
                {usuario && (
                    <NavLink to="/mis-pedidos" className={claseLink}>
                        Mis pedidos
                    </NavLink>
                )}
                {usuario?.role === "admin" && (
                    <NavLink to="/admin/resumen" className={claseLink}>
                        Panel
                    </NavLink>
                )}

                <div className="ml-auto flex items-center gap-3">
                    {usuario ? (
                        <>
                            <span className="text-sm text-slate-600">
                                {usuario.full_name} · {ETIQUETA_ROL[usuario.role]}
                            </span>
                            <Button variante="secundario" onClick={() => void handleLogout()}>
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={claseLink}>
                                Ingresar
                            </NavLink>
                            <NavLink to="/register" className={claseLink}>
                                Registrarse
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}